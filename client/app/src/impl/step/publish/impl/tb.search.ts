
import { SearchSkuApiImpl } from "@src/impl/door/sku/search.sku";
import { StepResult } from "../../step.unit";
import { AbsPublishStep } from "./abs.publish";
import { DoorSkuDTO } from "@model/door/sku";

export class TbSearchStep extends AbsPublishStep{


    async doStep(): Promise<StepResult> {
        const skuItem : DoorSkuDTO = this.getParams("skuItem");
        const title = skuItem.baseInfo.title;
        const resourceId = this.getParams("resourceId");
        if(!title){
            return new StepResult(false, "title is required");
        }
        const searchSkuApi = new SearchSkuApiImpl();
        const skuId = await searchSkuApi.searchSku(resourceId, title);
        if(!skuId){
            return new StepResult(false, "skuId is not found");
        }
        skuItem.setItemId(skuId);
        this.setParams("skuItem", skuItem);
        return new StepResult(true, skuId);
    }

}
