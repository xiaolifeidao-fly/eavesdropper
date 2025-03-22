
import { SearchSkuApiImpl } from "@src/impl/door/sku/search.sku";
import { StepResponse, StepResult } from "../../step.unit";
import { AbsPublishStep } from "./abs.publish";
import { DoorSkuDTO } from "@model/door/sku";
import log from "electron-log"
import { DoorEntity } from "@src/door/entity";
import { SearchSkuRecord } from "@model/door/door";
import { saveSearchSkuRecord, searchSkuRecord } from "@api/door/door.api";

const cheerio = require('cheerio');

export class TbSearchStep extends AbsPublishStep{


    async getSkuId(pddSkuId: string): Promise<string | undefined> {
        const result = await searchSkuRecord("mb", pddSkuId);
        if(result){
            return result.skuId;
        }
        return undefined;
    }

    public isSkip(): boolean {
        return true;
    }


    async doStep(): Promise<StepResult> {
        const skuItem : DoorSkuDTO = this.getParams("skuItem");
        const title = skuItem.baseInfo.title;
        const resourceId = this.getParams("resourceId");
        if(!title){
            return new StepResult(false, "title is required");
        }
        const pddSkuId = skuItem.baseInfo.itemId;
        let skuId = await this.getSkuId(pddSkuId);
        if(skuId){
            skuItem.itemId = skuId;
            this.setParams("skuItem", skuItem);
            return new StepResult(true, skuId);
        }
        log.info("标题为：", title);
        const searchSkuApi = new SearchSkuApiImpl();
        const result = await searchSkuApi.searchSku(resourceId, title, pddSkuId);
        if(!result.code){
            if(result.validateUrl){
                return new StepResult(false, "搜索商品信息失败出现验证码", [
                    new StepResponse("validateUrl", result.validateUrl)
                ], result.getHeaderData(), result.validateUrl, result.getValidateParams());
            }
            return new StepResult(false, "获取商品信息失败");
        }
        skuId = await this.getSkuIdBySearchResult(result, title, pddSkuId);
        if(!skuId){
            return new StepResult(false, "skuId is not found");
        }
        skuItem.itemId = skuId;
        this.setParams("skuItem", skuItem);
        return new StepResult(true, skuId);
    }

    async getSkuIdBySearchResult(result : DoorEntity<any>, title : string, pddSkuId : string){
        if(result && result.code){
            const itemsArray = result.data?.itemsArray;
            log.info("搜索商品信息结果为：", itemsArray);
            if(!itemsArray || itemsArray.length === 0){
                return undefined;
            }
            const skuId = this.matchSkuId(title, itemsArray);
            if(skuId){
                const searchRecord = new SearchSkuRecord(undefined, "mb", title, String(skuId), pddSkuId);
                await saveSearchSkuRecord(searchRecord);
                return String(skuId);
            }
        }
        return undefined;
    }

    matchSkuId(title : string, itemsArray : {[key: string]: any}[]) : string | undefined{
        for(const item of itemsArray){
            const itemTitle = item.title;
            const htmlTitle = `<html><body>${itemTitle}</body></html>`;
            const $ = cheerio.load(htmlTitle);
            const textContent = $('body').text().trim().replace(/\s+/g, ' ');
            if(textContent == title){
                return item.item_id;
            }
        }
        return itemsArray[0].item_id;
    }
}