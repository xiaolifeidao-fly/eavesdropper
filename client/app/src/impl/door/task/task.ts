import log from 'electron-log'

import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'
import { AddSkuTaskReq, SkuPublishConfig, SkuPublishStatitic, SkuTask, SkuTaskPageResp, SkuTaskStatus, UpdateSkuTaskReq } from '@model/sku/skuTask'
import { AddSkuTaskItemReq, SkuTaskItem, SkuTaskItemStatus } from '@model/sku/sku-task-item'
import { addSkuTask, updateSkuTask } from '@api/sku/skuTask.api'
import { MbSkuApiImpl } from '../sku/sku'
import { SkuStatus } from '@model/sku/sku'
import { LabelValue } from '@model/base/base'


const taskStatusMap : { [key: string]: { label: string, value: string, color: string } } = {
    'pending': { label: '待执行', value: 'pending', color: 'gray' },
    'running': { label: '执行中', value: 'running', color: 'blue' },
    'done': { label: '已完成', value: 'done', color: 'green' },
    'failed': { label: '失败', value: 'failed', color: 'red' },
    'stop': { label: '已停止', value: 'stop', color: 'orange' },
}


// 任务Map
const taskMap = new Map<number, String>()

export class TaskApiImpl extends TaskApi {

  getStatusFromMemory(item : SkuTaskPageResp) {
    const status = item.status;
    if(status === 'running') {
      const cacheStatus = taskMap.get(item.id);
      if(cacheStatus === undefined) {
         return taskStatusMap['stop'];
      }
      return taskStatusMap[String(cacheStatus)];
    }
    return undefined;
  }

  @InvokeType(Protocols.INVOKE)
  async rebuildTaskList(list: SkuTaskPageResp[]) {
    return list.map(item => {
       const status = item.status;
       if(status === 'running') {
          const memoryStatus = this.getStatusFromMemory(item);
          if(memoryStatus === undefined) {
            return item;
          }
          item.status = memoryStatus.value;
          item.statusLableValue = new LabelValue(memoryStatus.label, memoryStatus.value, memoryStatus.color);
          return item;
       }
       return item;
    })
  }

  async updateTaskStatus(taskId: number, status: string) {
    taskMap.set(taskId, status)
    const req = new UpdateSkuTaskReq(status, "", [])
    await updateSkuTask(taskId, req);
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
    this.asyncStartSkuTask(skuTask) // 异步执行任务
    this.updateTaskStatus(skuTask.id, SkuTaskStatus.RUNNING)
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
        itemReq.sourceSkuId = skuResult.sourceSkuId
        itemReq.title = skuResult.name
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
        log.info('itemReq: ', itemReq)
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
      this.updateTaskStatus(task.id, SkuTaskStatus.DONE);
    } catch (error: any) {
      log.info('asyncStartSkuTask error: ', error)
      statistic.status = SkuTaskStatus.ERROR
      statistic.remark = error.message
      this.updateTaskStatus(task.id, SkuTaskStatus.ERROR);
    } finally {
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
  }

  @InvokeType(Protocols.INVOKE)
  async stop(taskId: number) {
    taskMap.delete(taskId);
  }

  async isTaskStop(taskId: number) {
    if(taskMap.get(taskId)) {
      return true;
    }
    return false;
  }

}
