import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MonitorPxxSkuApi extends ElectronApi{

    getApiName(): string {
        return "MonitorPxxSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async monitorSku(){
        return await this.invokeApi("monitorSku");
    }
}
