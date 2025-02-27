
import { getUrlParameter } from "@utils/url.util";
import { StepResponse, StepResult } from "../../step.unit";
import { AbsPublishStep } from "./abs.publish";
import { getDoorRecord, parseSku } from "@api/door/door.api";
import { DoorSkuDTO } from "@model/door/sku";
import {PDD} from "@enums/source";

export class PddSkuGetStep extends AbsPublishStep{


    async doStep(): Promise<StepResult> {
       //获取商品信息
       const itemKey = this.getParams("skuItemId")
       if(!itemKey){
           return new StepResult(false, "pxx skuId is required");
       }
       const doorKey = "PxxSkuMonitor";
       const type = PDD;
       const skuResult = await getDoorRecord(doorKey, itemKey, type);
       if(!skuResult){
           return new StepResult(false, "获取商品信息失败");
       }
       const skuData = skuResult.data;
       const skuItem : DoorSkuDTO | null = await parseSku(PDD, skuData);
       if(!skuItem){
           return new StepResult(false, "商品信息解析失败");
       }
       return new StepResult(true, "", [
           new StepResponse("skuItem", skuItem)
       ]);
    }


}