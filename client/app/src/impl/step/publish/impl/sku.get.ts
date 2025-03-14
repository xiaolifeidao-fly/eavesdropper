import { DoorEntity } from "@src/door/entity";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";
import  log from "electron-log";
import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { DoorSkuDTO } from "@model/door/sku";
import { parseSku } from "@api/door/door.api";
import { TB } from "@enums/source";

export class SkuGetStep extends StepUnit{


    async doStep(): Promise<StepResult> {
        //获取商品信息
        const resourceId = this.getParams("resourceId");
        const skuUrl = this.getParams("skuUrl");
        const skuResult = await this.getSkuInfo(resourceId, skuUrl);
        if(!skuResult.code){
            if(skuResult.validateUrl){
                return new StepResult(false, "获取商品信息失败出现验证码", [
                    new StepResponse("validateUrl", skuResult.validateUrl)
                ], skuResult.getHeaderData(), skuResult.validateUrl, skuResult.getValidateParams());
            }
            return new StepResult(false, "获取商品信息失败");
        }
        const skuData = skuResult.data;
        const skuItem : DoorSkuDTO | null = await parseSku(TB, skuData);
        if(!skuItem){
            return new StepResult(false, "商品信息解析失败");
        }
        return new StepResult(skuResult.code, "", [
            new StepResponse("skuItem", skuItem)
        ]);
    }

    
    async getSkuInfo(publishResourceId : number, skuUrl : string){
        let requestSuccess = false;
        let requestCount = 0;
        let skuResult : DoorEntity<any> | undefined = undefined;
        while(!requestSuccess && requestCount <=1 ){
            const skuApi = new MbSkuApiImpl();
            skuResult = await skuApi.findMbSkuInfo(publishResourceId, skuUrl);
            if(!skuResult || !skuResult.code){
                if(skuResult && skuResult.validateUrl){
                    return skuResult;
                }
                log.error("findMbSkuInfo error", skuResult);
                requestCount++;
                continue;
            }
            requestSuccess = true;
        }
        if(!skuResult){
            return new DoorEntity<any>(false, {});
        }
        return skuResult;
    }
}