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
    async publishShop(publishResourceId : number, taskId : number, skuUrl : string) : Promise<Sku|undefined>{
        return await this.invokeApi("publishShop", publishResourceId, taskId, skuUrl);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishShops(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        return await this.invokeApi("batchPublishShops", publishResourceId, skuUrls);
    }

    @InvokeType(Protocols.TRRIGER)
    async onPublishShopMessage(skuId : number, skuStatus : string, statistic : SkuPublishStatitic){
        return await this.invokeApi("onPublishShopMessage", skuId, skuStatus, statistic);
    }

}
