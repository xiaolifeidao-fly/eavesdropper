import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { GatherSku } from "@model/gather/gather-sku";

export class MonitorPxxSkuApi extends ElectronApi{

    getApiName(): string {
        return "MonitorPxxSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async monitorSku(resourceId: number, gatherBatchId : number){
        return await this.invokeApi("monitorSku", resourceId, gatherBatchId);
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
    async goBack(){
        return await this.invokeApi('goBack');
    }

    @InvokeType(Protocols.INVOKE)
    async goHome(){
        return await this.invokeApi('goHome');
    }

    @InvokeType(Protocols.INVOKE)
    async openLocalHtmlFile(source: string, itemKey: string): Promise<boolean> {
        return await this.invokeApi('openLocalHtmlFile', source, itemKey);
    }

    @InvokeType(Protocols.INVOKE)
    async openGatherTool(resourceId: number, gatherBatchId : number): Promise<boolean> {
        return await this.invokeApi('openGatherTool', resourceId, gatherBatchId);
    }

    @InvokeType(Protocols.INVOKE)
    async openSkuInfoPage(skuId: string): Promise<boolean> {
        return await this.invokeApi('openSkuInfoPage', skuId);
    }
}
