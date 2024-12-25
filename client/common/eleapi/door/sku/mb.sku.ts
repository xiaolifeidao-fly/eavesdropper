import { Sku, SkuPublishStatitic } from "@model/sku/sku";
import { Task } from "@model/task/task";
import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbSkuApi extends ElectronApi {

    getApiName(): string {
        return "MbSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(url : string) {
        return await this.invokeApi("findMbSkuInfo", url);
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<Sku|undefined>{
        return await this.invokeApi("publishSku", publishResourceId, skuUrl, taskId);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        return await this.invokeApi("batchPublishSkus", publishResourceId, skuUrls);
    }

    @InvokeType(Protocols.TRRIGER)
    async onPublishSkuMessage(callback : (skuId : number, skuStatus : string, statistic : SkuPublishStatitic) => void){
        return await this.invokeApi("onPublishSkuMessage", callback);
    }

}
