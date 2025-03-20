import { ElectronApi, InvokeType, Protocols } from '@eleapi/base'
import { SkuTask } from '@model/sku/skuTask'

export class TaskApi extends ElectronApi {
  getApiName(): string {
    return 'TaskApi'
  }

  @InvokeType(Protocols.INVOKE)
  async startTask(skuTask: SkuTask): Promise<SkuTask> {
    return await this.invokeApi('startTask', skuTask)
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
}
