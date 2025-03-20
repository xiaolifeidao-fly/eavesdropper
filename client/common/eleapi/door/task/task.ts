import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";

export class TaskApi extends ElectronApi {

    getApiName(): string {
        return "TaskApi";
    }

    @InvokeType(Protocols.INVOKE)
    async startTask(taskId : number) {
        return await this.invokeApi("startTask", taskId);
    }

    @InvokeType(Protocols.INVOKE)
    async stop(taskId : number) {
        return await this.invokeApi("stop", taskId);
    }
}
