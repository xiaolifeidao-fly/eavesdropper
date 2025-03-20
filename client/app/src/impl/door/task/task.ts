import { TaskApi } from '@eleapi/door/task/task'
import { InvokeType, Protocols } from '@eleapi/base'
import { StoreApi } from '@eleapi/store/store'

export class TaskApiImpl extends TaskApi {
  @InvokeType(Protocols.INVOKE)
  async startTask(taskId: number) {
    this.setTaskStartFlag(taskId, true)
  }

  @InvokeType(Protocols.INVOKE)
  async stop(taskId: number) {
    this.setTaskStartFlag(taskId, false)
  }

  async setTaskStartFlag(taskId: number, status: boolean) {
    const store = new StoreApi()
    const taskKey = `task_${taskId}`
    await store.setItem(taskKey, status)
  }
}
