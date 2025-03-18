
import { SearchSkuApiImpl } from "@src/impl/door/sku/search.sku";
import { StepResponse, StepResult } from "../../step.unit";
import { AbsPublishStep } from "./abs.publish";
import { DoorSkuDTO } from "@model/door/sku";
import log from "electron-log"
import { DoorEntity } from "@src/door/entity";
import { SearchSkuRecord } from "@model/door/door";
import { getDoorCategoryByPddCatId, saveSearchSkuRecord, searchSkuRecord } from "@api/door/door.api";
import { searchCategory } from "@src/door/mb/sku/search.category";

const cheerio = require('cheerio');

export class TbPublishSearchStep extends AbsPublishStep{


    async getCatId(pddSkuId: string): Promise<string | undefined> {
        const tbCategory = this.getParams("tbCategory");
        if(tbCategory){
            return tbCategory.categoryId;
        }
        const result = await getDoorCategoryByPddCatId(pddSkuId);
        if(result){
            this.setParams("tbCategory", {
                categoryId : result.tbCatId,
                categoryName : result.tbCatName
            });
            return result.tbCatId;
        }
        return undefined;
    }

    async doStep(): Promise<StepResult> {
        const skuItem : DoorSkuDTO = this.getParams("skuItem");
        const title = skuItem.baseInfo.title;
        const resourceId = this.getParams("resourceId");
        if(!title){
            return new StepResult(false, "title is required");
        }

        let catId = await this.getCatId(skuItem.baseInfo.catId);
        if(catId){
            return new StepResult(true, "搜索商品分类成功");
        }
        log.info("标题为：", title);
        const validateTag = this.getValidateTag();
        const result = await searchCategory(resourceId, title, validateTag);
        if(!result || !result.getCode()){
            if(result?.getValidateUrl()){
                return new StepResult(false, "搜索商品信息失败出现验证码", [
                    new StepResponse("validateUrl", result.validateUrl)
                ], result.getHeaderData(), result.validateUrl, result.getValidateParams());            
            }
            return new StepResult(false, "获取商品分类失败");
        }
        log.info("搜索商品分类成功", result);
        this.setParams("tbCategory", result.getData());
        return new StepResult(true, "搜索商品分类成功");
    }

    async getSkuIdBySearchResult(result : DoorEntity<any>, title : string, pddSkuId : string){
        if(result && result.code){
            const itemsArray = result.data?.itemsArray;
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