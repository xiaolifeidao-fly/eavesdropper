import { SkuPublishResult } from '@model/sku/sku'
import { ElectronApi, InvokeType, Protocols } from '@eleapi/base'
import { SkuPublishConfig, SkuPublishStatitic, SkuTask } from '@model/sku/skuTask'

export class TaskApi extends ElectronApi {
  getApiName(): string {
    return 'TaskApi'
  }

  @InvokeType(Protocols.INVOKE)
  async getTask(taskId: number): Promise<SkuTask | undefined> {
    return await this.invokeApi('getTask', taskId)
  }

  @InvokeType(Protocols.INVOKE)
  async pushTask(skuTask: SkuTask) {
    return await this.invokeApi('pushTask', skuTask)
  }

  @InvokeType(Protocols.INVOKE)
  async startTask(publishResourceId: number, publishConfig: SkuPublishConfig, skuSource: string, skuUrls: string[]): Promise<SkuTask> {
    return await this.invokeApi('startTask', publishResourceId, publishConfig, skuSource, skuUrls)
  }

  @InvokeType(Protocols.INVOKE)
  async stop(taskId: number) {
    return await this.invokeApi('stop', taskId)
  }

  @InvokeType(Protocols.INVOKE)
  async isTaskStop(taskId: number) {
    return await this.invokeApi('isTaskStop', taskId)
  }

  @InvokeType(Protocols.INVOKE)
  async removeTaskFlag(taskId: number) {
    return await this.invokeApi('removeTaskFlag', taskId)
  }

  @InvokeType(Protocols.TRRIGER)
  async onPublishSkuMessage(callback: (sku: SkuPublishResult | undefined, statistic: SkuPublishStatitic) => void) {
    return await this.onMessage('onPublishSkuMessage', callback)
  }
}
