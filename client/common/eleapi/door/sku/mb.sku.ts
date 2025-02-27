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
    async publishSku(publishResourceId : number, skuSource: string, skuUrl : string, taskId : number, publishConfig?: SkuPublishConfig) : Promise<SkuPublishResult>{
        return await this.invokeApi("publishSku", publishResourceId, skuSource, skuUrl, taskId, publishConfig);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, publishConfig: SkuPublishConfig, skuSource: string, skuUrls : string[]) : Promise<SkuTask|undefined>{
        return await this.invokeApi("batchPublishSkus", publishResourceId, publishConfig, skuSource, skuUrls);
    }

    @InvokeType(Protocols.TRRIGER)
    async onPublishSkuMessage(callback : (sku : SkuPublishResult | undefined, statistic : SkuPublishStatitic) => void){
        return await this.onMessage("onPublishSkuMessage",callback);
    }

}
