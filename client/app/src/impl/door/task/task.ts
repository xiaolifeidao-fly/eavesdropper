import log from 'electron-log'

import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'
import { AddSkuTaskReq, PriceRangeConfig, SkuPublishConfig, SkuPublishStatitic, SkuTask, SkuTaskPageResp, SkuTaskStatus, UpdateSkuTaskReq } from '@model/sku/skuTask'
import { SkuPublishResult } from '@model/sku/sku'
import { AddSkuTaskItemReq, SkuTaskItem, SkuTaskItemStatus } from '@model/sku/sku-task-item'
import { addSkuTask, updateSkuTask, getSkuTask } from '@api/sku/skuTask.api'
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
      let memoryStatus = this.getStatusFromMemory(item);
       if(memoryStatus !== undefined) {
          item.status = memoryStatus.value;
          item.statusLableValue = new LabelValue(memoryStatus.label, memoryStatus.value, memoryStatus.color);
          return item;
       }

       if (item.status === SkuTaskStatus.RUNNING && memoryStatus === undefined) {
        item.status = SkuTaskStatus.STOP;
        item.statusLableValue = new LabelValue('已停止', SkuTaskStatus.STOP, 'orange');
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
    log.info('startTask', publishResourceId, publishConfig, skuSource, skuUrls)
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
    return skuTask
  }

  // 异步执行任务
  async asyncStartSkuTask(task: SkuTask, progress: number = 0, isCallback: boolean = true) {
    let taskRemark = ''
    let taskItems: AddSkuTaskItemReq[] = []

    let isStop = false
    let taskStatus = SkuTaskStatus.RUNNING // 任务状态
    this.updateTaskStatus(task.id, SkuTaskStatus.RUNNING) // 更新内存中任务状态
    const statistic = new SkuPublishStatitic(task.id, task.count, 0, 0, taskStatus) // 任务统计信息

    const items = task.items ?? []
    // 对items通过id排序,保证任务项的顺序
    items.sort((a: SkuTaskItem, b: SkuTaskItem) => {
      if (!a.id || !b.id) return 0
      return a.id - b.id
    })

    // 在继续执行任务时，发送已完成任务消息， progress 是任务上次执行的位置
    for (let i = 0; i < progress; i++) {
      const item = items[i]
      const skuResult = new SkuPublishResult(item.id ?? 0, task.publishResourceId, item.status ?? '')
      skuResult.name = item.title ?? ''
      skuResult.url = item.url ?? ''
      skuResult.sourceSkuId = item.sourceSkuId ?? ''
      skuResult.key = i
      this.send('onPublishSkuMessage', skuResult, statistic)
    }

    // await new Promise(resolve => setTimeout(resolve, 100*1000));

    const store = new StoreApi()
    const skuApi = new MbSkuApiImpl()
    try {
      for (; progress < items.length; progress++) {
        // 记录当前任务执行的位置
        await store.setItem(`task_${task.id}_progress`, progress)

        // 模拟延迟
        // await new Promise(resolve => setTimeout(resolve, 1*1000));
        // 判断任务是否手动停止
        if (await this.isTaskStop(task.id)) {
          isStop = true
          break
        }

        // 记录当前任务执行的位置
        await store.setItem(`task_${task.id}_progress`, progress)
        // 发布商品
        const item = items[progress]
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
        if (isCallback) {
          this.send('onPublishSkuMessage', skuResult, statistic) // 发送进度
        }

        if (progress % 2 == 0 || taskStatus === SkuTaskStatus.DONE) {
          const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems)
          await updateSkuTask(task.id, req)
          taskItems = []
        }
      }

      // 如果任务没有停止，则更新任务状态为已完成
      // if (!isStop) {
      //   this.updateTaskStatus(task.id, SkuTaskStatus.DONE);
      // }
      log.info('asyncStartSkuTask done')
    } catch (error: any) {
      log.info('asyncStartSkuTask error: ', error)
      statistic.status = SkuTaskStatus.ERROR
      statistic.remark = error.message
      this.updateTaskStatus(task.id, SkuTaskStatus.ERROR);
    } finally {
      if (isCallback) {
        this.send('onPublishSkuMessage', undefined, statistic) // 发送进度
      }
      for (; progress < items.length; progress++) {
        const item = items[progress]
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

      let req: UpdateSkuTaskReq
      if (isStop) {
        req = new UpdateSkuTaskReq(SkuTaskStatus.STOP, taskRemark, taskItems)
        this.updateTaskStatus(task.id, SkuTaskStatus.STOP);
      } else {
        req = new UpdateSkuTaskReq(SkuTaskStatus.DONE, taskRemark, taskItems)
        this.updateTaskStatus(task.id, SkuTaskStatus.DONE);
      }
      await updateSkuTask(task.id, req)
    }
  }

  @InvokeType(Protocols.INVOKE)
  async stop(taskId: number) {
    taskMap.set(taskId, SkuTaskStatus.STOP);
  }

  async isTaskStop(taskId: number) {
    const status = taskMap.get(taskId);
    if(status === SkuTaskStatus.STOP) {
      return true;
    }
    return false;
  }

  @InvokeType(Protocols.INVOKE)
  async continueTask(taskId: number) {
    const skuTask = await getSkuTask(taskId);

    if (skuTask.items === undefined) {
      throw new Error('任务项为空')
    }

    // 获取任务执行的位置
    const store = new StoreApi()
    let progress = await store.getItem(`task_${taskId}_progress`)
    if (progress === undefined) {
      progress = 0
    }
    this.asyncStartSkuTask(skuTask, progress);
    return skuTask;
  }

  @InvokeType(Protocols.INVOKE)
  async republishTask(taskId: number) {
    const skuTask = await getSkuTask(taskId);
    this.asyncStartSkuTask(skuTask, 0);
    return skuTask;
  }
}
