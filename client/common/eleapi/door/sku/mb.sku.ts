import { SkuPublishResult } from "@model/sku/sku";
import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { SkuTask, SkuPublishStatitic, SkuPublishConfig } from "@model/sku/skuTask";

export class MbSkuApi extends ElectronApi {

    getApiName(): string {
        return "MbSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(publishResourceId : number, url : string) {
        return await this.invokeApi("findMbSkuInfo", publishResourceId, url);
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<SkuPublishResult>{
        return await this.invokeApi("publishSku", publishResourceId, skuUrl, taskId);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, publishConfig: SkuPublishConfig, skuUrls : string[]) : Promise<SkuTask|undefined>{
        return await this.invokeApi("batchPublishSkus", publishResourceId, publishConfig, skuUrls);
    }

    @InvokeType(Protocols.TRRIGER)
    async onPublishSkuMessage(callback : (sku : SkuPublishResult | undefined, statistic : SkuPublishStatitic) => void){
        return await this.onMessage("onPublishSkuMessage",callback);
    }

}
