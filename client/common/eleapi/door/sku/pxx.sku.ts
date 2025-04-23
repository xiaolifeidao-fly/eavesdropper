import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { GatherSku } from "@model/gather/gather-sku";

export class MonitorPxxSkuApi extends ElectronApi{

    getApiName(): string {
        return "MonitorPxxSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async monitorSku(gatherBatchId: number){
        return await this.invokeApi("monitorSku", gatherBatchId);
    }

    @InvokeType(Protocols.TRRIGER)
    async onGatherSkuMessage(callback: (gatherSku: GatherSku) => void) {
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
