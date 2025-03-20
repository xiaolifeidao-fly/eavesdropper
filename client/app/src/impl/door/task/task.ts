import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'
import { AddSkuTaskReq, SkuTask } from '@model/sku/skuTask'
import { addSkuTask } from '@api/sku/skuTask.api'

export class TaskApiImpl extends TaskApi {
  @InvokeType(Protocols.INVOKE)
  async startTask(skuTask: SkuTask): Promise<SkuTask> {
    const priceRate = skuTask.skuPublishConfig?.priceRate
    const req = new AddSkuTaskReq(
      skuTask.count,
      skuTask.publishResourceId,
      skuTask.source,
      '',
      priceRate
    )
    const taskId = (await addSkuTask(req)) as number
    skuTask.id = taskId
    this.setTaskStartFlag(skuTask.id, true)
    return skuTask
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
    if (result === undefined || result === false) {
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
