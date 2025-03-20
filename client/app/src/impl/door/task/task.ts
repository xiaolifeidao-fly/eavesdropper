import log from 'electron-log'

import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'
import { AddSkuTaskItemReq, AddSkuTaskReq, SkuPublishConfig, SkuPublishStatitic, SkuTask, SkuTaskItemStatus, SkuTaskStatus, UpdateSkuTaskReq } from '@model/sku/skuTask'
import { addSkuTask, updateSkuTask } from '@api/sku/skuTask.api'
import { MbSkuApiImpl } from '../sku/sku'
import { SkuStatus } from '@model/sku/sku'

export class TaskApiImpl extends TaskApi {
  @InvokeType(Protocols.INVOKE)
  async startTask(publishResourceId: number, publishConfig: SkuPublishConfig, skuSource: string, skuUrls: string[]): Promise<SkuTask> {
    const count = skuUrls.length
    const req = new AddSkuTaskReq(count, publishResourceId, skuSource, '', publishConfig.priceRate)
    const taskId = (await addSkuTask(req)) as number

    let taskItems: AddSkuTaskItemReq[] = []
    for (let i = 0; i < skuUrls.length; i++) {
      const item = new AddSkuTaskItemReq(0, skuUrls[0], SkuTaskItemStatus.PENDING, skuSource)
      taskItems.push(item)
    }
    let skuTask = new SkuTask(taskId, SkuTaskStatus.PENDING, count, publishResourceId, skuSource, publishConfig, taskItems)
    this.setTaskStartFlag(skuTask.id, true)

    // 异步执行任务
    this.asyncStartSkuTask(skuTask, skuUrls)

    return skuTask
  }

  // 异步执行任务
  async asyncStartSkuTask(task: SkuTask, skuUrls: string[]) {
    let progress = 0
    let taskRemark = ''
    let taskItems: AddSkuTaskItemReq[] = []

    let isStop = false
    let taskStatus = SkuTaskStatus.RUNNING
    const statistic = new SkuPublishStatitic(task.id, task.count, 0, 0, taskStatus)

    const skuApi = new MbSkuApiImpl()
    let i = 0
    try {
      for (; i < skuUrls.length; i++) {
        // 模拟延迟
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // 判断任务是否手动停止
        if (await this.isTaskStop(task.id)) {
          isStop = true
          break
        }

        // 发布商品
        const skuUrl = skuUrls[i]
        const taskItem = new AddSkuTaskItemReq(task.id, skuUrl, SkuTaskItemStatus.SUCCESS, task.source, taskRemark)
        const skuResult = await skuApi.publishSku(task.publishResourceId, task.source, skuUrl, task.id, task.skuPublishConfig)
        skuResult.key = progress
        switch (skuResult.status) {
          case SkuStatus.ERROR:
            statistic.errorNum += 1
            taskItem.status = SkuTaskItemStatus.FAILED
            taskItem.remark = skuResult.remark
            break
          case SkuStatus.EXISTENCE:
            statistic.errorNum += 1
            taskItem.status = SkuTaskItemStatus.EXISTENCE
            taskItem.remark = skuResult.remark
            break
          case SkuStatus.SUCCESS:
            taskItem.skuId = skuResult.id
            statistic.successNum += 1
            taskItem.status = SkuTaskItemStatus.SUCCESS
            break
        }
        taskItems.push(taskItem) // 添加任务项

        taskStatus = progress == task.count - 1 ? SkuTaskStatus.DONE : taskStatus
        statistic.status = taskStatus
        this.send('onPublishSkuMessage', skuResult, statistic) // 发送进度

        // 更新任务状态
        if (progress % 200 == 0 || taskStatus === SkuTaskStatus.DONE) {
          // 更新任务状态
          const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems)
          await updateSkuTask(task.id, req)
          taskItems = []
        }
      }
    } catch (error: any) {
      log.info('asyncStartSkuTask error: ', error)
      statistic.status = SkuTaskStatus.ERROR
      statistic.remark = error.message
    } finally {
      await this.removeTaskFlag(task.id)
      this.send('onPublishSkuMessage', undefined, statistic) // 发送进度
      for (; i < skuUrls.length; i++) {
        const taskItem = new AddSkuTaskItemReq(task.id, skuUrls[i], SkuTaskItemStatus.FAILED, task.source, '')
        if (isStop) {
          taskItem.status = SkuTaskItemStatus.CANCEL
          taskItem.remark = '发布取消'
        }

        if (statistic.status == SkuTaskStatus.ERROR) {
          taskItem.status = SkuTaskItemStatus.FAILED
          taskItem.remark = statistic.remark
        }
        taskItems.push(taskItem)
      }

      if (taskItems.length > 0) {
        const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems)
        await updateSkuTask(task.id, req)
      }
    }
    return
  }

  @InvokeType(Protocols.INVOKE)
  async stop(taskId: number) {
    if (await this.isTaskStop(taskId)) {
      return
    }
    this.setTaskStartFlag(taskId, false)
  }

  @InvokeType(Protocols.INVOKE)
  async isTaskStop(taskId: number) {
    const store = new StoreApi()
    const result = await store.getItem(this.getTaskKey(taskId))
    if (result === undefined || result === true) {
      return false
    }
    return true
  }

  @InvokeType(Protocols.INVOKE)
  async removeTaskFlag(taskId: number) {
    const store = new StoreApi()
    await store.removeItem(this.getTaskKey(taskId))
  }

  getTaskKey(taskId: number) {
    return `task_${taskId}`
  }

  async setTaskStartFlag(taskId: number, status: boolean) {
    const store = new StoreApi()
    await store.setItem(this.getTaskKey(taskId), status)
  }
}
