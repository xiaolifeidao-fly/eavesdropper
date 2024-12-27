import { SkuPublishResult } from "@model/sku/sku";
import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { SkuTask, SkuPublishStatitic } from "@model/sku/skuTask";

export class MbSkuApi extends ElectronApi {

    getApiName(): string {
        return "MbSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(url : string) {
        return await this.invokeApi("findMbSkuInfo", url);
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<SkuPublishResult>{
        return await this.invokeApi("publishSku", publishResourceId, skuUrl, taskId);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, skuUrls : string[]) : Promise<SkuTask|undefined>{
        return await this.invokeApi("batchPublishSkus", publishResourceId, skuUrls);
    }

    @InvokeType(Protocols.TRRIGER)
    async onPublishSkuMessage(callback : (sku : SkuPublishResult | undefined, statistic : SkuPublishStatitic) => void){
        return await this.onMessage("onPublishSkuMessage",callback);
    }

}
