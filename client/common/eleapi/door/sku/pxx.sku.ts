import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { DoorSkuDTO } from "@model/door/sku";

export class MonitorPxxSkuApi extends ElectronApi{

    getApiName(): string {
        return "MonitorPxxSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async monitorSku(){
        return await this.invokeApi("monitorSku");
    }

    @InvokeType(Protocols.TRRIGER)
    async onGatherSkuMessage(callback: (doorSkuDTO: DoorSkuDTO | null) => void) {
      return await this.onMessage('onGatherSkuMessage', callback)
    }

    @InvokeType(Protocols.INVOKE)
    async checkLocalHtmlExists(source: string, itemKey: string): Promise<boolean> {
        return await this.invokeApi('checkLocalHtmlExists', source, itemKey);
    }

    @InvokeType(Protocols.INVOKE)
    async openLocalHtmlFile(source: string, itemKey: string): Promise<boolean> {
        return await this.invokeApi('openLocalHtmlFile', source, itemKey);
    }
}
