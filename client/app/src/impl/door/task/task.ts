import log from 'electron-log'

import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'
import { AddSkuTaskReq, SkuPublishConfig, SkuPublishStatitic, SkuTask, SkuTaskStatus, UpdateSkuTaskReq } from '@model/sku/skuTask'
import { AddSkuTaskItemReq, SkuTaskItem, SkuTaskItemStatus } from '@model/sku/sku-task-item'
import { addSkuTask, updateSkuTask } from '@api/sku/skuTask.api'
import { MbSkuApiImpl } from '../sku/sku'
import { SkuStatus } from '@model/sku/sku'

// 任务Map
const taskMap = new Map<number, SkuTask>()

export class TaskApiImpl extends TaskApi {
  getTaskMap(): Map<number, SkuTask> {
    return taskMap
  }

  @InvokeType(Protocols.INVOKE)
  async getTask(taskId: number): Promise<SkuTask | undefined> {
    return taskMap.get(taskId)
  }

  @InvokeType(Protocols.INVOKE)
  async pushTask(skuTask: SkuTask) {
    taskMap.set(skuTask.id, skuTask)
  }

  updateTaskItem(taskId: number, item: SkuTaskItem) {
    const task = taskMap.get(taskId)
    if (task === undefined) {
      return
    }

    const items = task.items
    if (items === undefined || items.length <= 0) {
      return
    }

    task.items = items.map((i) => {
      return i.id == item.id ? item : i
    })

    taskMap.set(taskId, task)
  }

  @InvokeType(Protocols.INVOKE)
  async startTask(publishResourceId: number, publishConfig: SkuPublishConfig, skuSource: string, skuUrls: string[]): Promise<SkuTask> {
    const count = skuUrls.length
    let taskItems: AddSkuTaskItemReq[] = []
    for (let i = 0; i < skuUrls.length; i++) {
      const item = new AddSkuTaskItemReq(0, skuUrls[i], SkuTaskItemStatus.PENDING, skuSource)
      taskItems.push(item)
    }
    const req = new AddSkuTaskReq(count, publishResourceId, skuSource)
    req.priceRange = publishConfig.priceRate
    req.items = taskItems
    const skuTask = await addSkuTask(req) // 保存任务
    skuTask.skuPublishConfig = publishConfig
    await this.setTaskStartFlag(skuTask.id, true)
    this.asyncStartSkuTask(skuTask) // 异步执行任务
    return skuTask
  }

  // 异步执行任务
  async asyncStartSkuTask(task: SkuTask) {
    // this.pushTask(task) // 将任务添加到内存中
    let progress = 0
    let taskRemark = ''
    let taskItems: AddSkuTaskItemReq[] = []

    let isStop = false
    let taskStatus = SkuTaskStatus.RUNNING
    const statistic = new SkuPublishStatitic(task.id, task.count, 0, 0, taskStatus)

    const items = task.items ?? []
    const skuApi = new MbSkuApiImpl()
    let i = 0
    try {
      for (; i < items.length; i++) {
        // 模拟延迟
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // 判断任务是否手动停止
        if (await this.isTaskStop(task.id)) {
          isStop = true
          break
        }

        // 发布商品
        const item = items[i]
        const skuUrl = item.url ?? ''
        const itemReq = new AddSkuTaskItemReq(task.id, skuUrl, SkuTaskItemStatus.SUCCESS, task.source, taskRemark)
        itemReq.id = item.id
        const skuResult = await skuApi.publishSku(task.publishResourceId, task.source, skuUrl, task.id, task.skuPublishConfig)
        skuResult.key = progress
        switch (skuResult.status) {
          case SkuStatus.EXISTENCE:
            statistic.errorNum += 1
            itemReq.status = SkuTaskItemStatus.EXISTENCE
            itemReq.remark = skuResult.remark
            break
          case SkuStatus.SUCCESS:
            statistic.successNum += 1
            itemReq.skuId = skuResult.id
            itemReq.status = SkuTaskItemStatus.SUCCESS
            break
          case SkuStatus.ERROR:
            statistic.errorNum += 1
            itemReq.status = SkuTaskItemStatus.FAILED
            itemReq.remark = skuResult.remark
            break
          default:
            statistic.errorNum += 1
            itemReq.status = SkuTaskItemStatus.FAILED
            itemReq.remark = '错误:未知的商品发布结果'
            break
        }
        taskItems.push(itemReq) // 添加任务项

        // item.name = skuResult.name
        // this.updateTaskItem(task.id, item)
        taskStatus = progress == task.count - 1 ? SkuTaskStatus.DONE : taskStatus
        statistic.status = taskStatus
        this.send('onPublishSkuMessage', skuResult, statistic) // 发送进度

        if (progress % 200 == 0 || taskStatus === SkuTaskStatus.DONE) {
          const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems)
          await updateSkuTask(task.id, req)
          taskItems = []
        }

        progress++
      }
    } catch (error: any) {
      log.info('asyncStartSkuTask error: ', error)
      statistic.status = SkuTaskStatus.ERROR
      statistic.remark = error.message
    } finally {
      await this.removeTaskFlag(task.id)
      this.send('onPublishSkuMessage', undefined, statistic) // 发送进度
      for (; i < items.length; i++) {
        const item = items[i]
        const skuUrl = item.url ?? ''
        const taskItem = new AddSkuTaskItemReq(task.id, skuUrl, SkuTaskItemStatus.FAILED, task.source, '')
        taskItem.id = item.id
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
        const req = new UpdateSkuTaskReq(SkuTaskStatus.DONE, taskRemark, taskItems)
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
