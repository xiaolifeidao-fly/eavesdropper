
import { SearchSkuApiImpl } from "@src/impl/door/sku/search.sku";
import { StepResult } from "../../step.unit";
import { AbsPublishStep } from "./abs.publish";
import { DoorSkuDTO } from "@model/door/sku";
import log from "electron-log"
export class TbSearchStep extends AbsPublishStep{


    async doStep(): Promise<StepResult> {
        const skuItem : DoorSkuDTO = this.getParams("skuItem");
        const title = skuItem.baseInfo.title;
        const resourceId = this.getParams("resourceId");
        if(!title){
            return new StepResult(false, "title is required");
        }
        log.info("标题为：", title);
        const skuId = await this.getSkuId(resourceId, title);
        log.info("seach skuId is ", skuId);
        if(!skuId){
            return new StepResult(false, "skuId is not found");
        }
        skuItem.itemId = skuId;
        this.setParams("skuItem", skuItem);
        return new StepResult(true, skuId);
    }

    async getSkuId(resourceId : number, title : string){
        let requestSuccess = false;
        let requestCount = 0;
        const searchSkuApi = new SearchSkuApiImpl();
        let skuId : string | undefined = undefined;
        while(!requestSuccess && requestCount <=1 ){
            skuId = await searchSkuApi.searchSku(resourceId, title);
            if(!skuId){
                log.error("searchSku error", skuId);
                requestCount++;
                continue;
            }
            requestSuccess = true;
        }
        return skuId;
    }
}
