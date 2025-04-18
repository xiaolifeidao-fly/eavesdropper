import axios from "axios";
import { StepResult, StepUnit } from "../../step.unit";
import log from "electron-log"
import { AbsPublishStep } from "./abs.publish";
import { MbEngine } from "@src/door/mb/mb.engine";
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { getDoorCatProps, getDoorCatPropsByAI, saveDoorCatProp } from "@api/door/door.api";
import { DoorSkuCatProp } from "@model/door/door";
import { FoodSupport } from "../fill.food";
import { AiFillSupport } from "../ai.fill";
import { isNeedCombine, isNeedSellPointCollection, SaleProBuilder } from "../sku.sale.build";
import { getAndSortImage } from "../image.support";






export class UpdateDraftStep extends AbsPublishStep {

    fileterKey = ["descType", "category"]

    fixRequiredDataHandler: { [key : string] : (fieldPros : { [key : string] : any }, draftData : { [key : string] : any }, step : StepUnit) => void } = {
        "multiDiscountPromotion": this.fixMultiDiscountPromotion
    }


    async getPage(engine: MbEngine<any>, draftId: string){
        const newPage = await engine.init();
        if(!newPage){
            log.error("newPage is null");
            return null;
        }
        await newPage.goto("https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId);
        return newPage;
    }

     fixMultiDiscountPromotion(fieldPros : { [key : string] : any }, draftData : { [key : string] : any }, step : StepUnit){
        const dataSources = fieldPros.dataSource;
        if(!dataSources){
            return;
        }
        const dataSource = dataSources[0];
        if(!dataSource){
            return;
        }
        draftData.multiDiscountPromotion = {
            value: String(dataSource.max),
            type: 1,
            enable: true
        }
        step.setParams("multiDiscountPromotionValue", String(dataSource.max));
    }

    async againFillSaleInfo(commonData : { [key : string] : any }, skuItem : DoorSkuDTO, draftData : { [key : string] : any }){
        const priceRate = this.getParams("priceRate");
        const components = commonData.data.components;
        const needCombine = isNeedCombine(components);
        const needSellPointCollection = isNeedSellPointCollection(components);
        const saleProBuilder = new SaleProBuilder(priceRate, needCombine, needSellPointCollection);
        await saleProBuilder.fillSellSku(skuItem, draftData, );
    }

    async doStep(): Promise<StepResult> {
        const draftData = this.getParams("draftData");
        const draftId = this.getParams("draftId");
        const catId = this.getParams("catId");
        const startTraceId = this.getParams("startTraceId");
        const skuItem = this.getParams("skuItem");
        const resourceId = this.getParams("resourceId");
        const engine = new MbEngine(resourceId);
        let page = undefined;
        try{
            page = await this.getPage(engine, draftId);
            if(!page){
                log.error("newPage is null");
                return new StepResult(false, "获取更新草稿新页面失败");
            }
            const commonData = await this.getCommonData(page);
            await this.fillCategory(commonData);
            const requestHeader = this.getHeader(); 
            if(!requestHeader){
                log.error("requestHeader is null");
                return new StepResult(false, "获取请求头失败");
            }
            await this.fillCategoryList(skuItem, draftData, commonData, requestHeader, catId, startTraceId);
            await this.againFillSaleInfo(commonData, skuItem, draftData);
            const foodSupport = new FoodSupport();
            const imageFileList = this.getParams("imageFileList");
            const mainImageList = getAndSortImage(imageFileList, "main");
            const foodResult = await foodSupport.doFill(commonData.data.components, skuItem.baseInfo.skuItems, draftData, catId, startTraceId, requestHeader,mainImageList);
            if(!foodResult){
                return new StepResult(false, foodSupport.fillMessage);
            }
            await this.fixRequiredData(draftData, skuItem, commonData);
            const validateResult = this.validateDraftData(draftData, skuItem, commonData);
            if(!validateResult.validateResult){
                await this.releaseDraftData(draftId, resourceId);
                return new StepResult(false, validateResult.message);
            }
            const updateResult = await this.updateDraftData(catId, draftId, requestHeader, startTraceId, draftData);
            if(!updateResult){
                await this.releaseDraftData(draftId, resourceId);
                return new StepResult(false, "更新草稿失败");
            }
            this.setParams("updateDraftData", draftData);
            this.setParams("draftHeader", requestHeader);
            
            return new StepResult(true, "更新草稿成功");
        } catch (error) {
            await this.releaseDraftData(draftId, resourceId);
            log.error("UpdateDraftStep error", error);
            return new StepResult(false, "更新草稿失败");
        }finally{
            await engine.closePage();
            const page = this.getParams("page");
            if(page){
                await page.close();
            }
        }
    }

    async fillCategory(commonData : { [key : string] : any }){
        const catId = commonData.data.components?.guaranteeService?.props?.icmp?.global?.catId;
        if(catId){
            const tbCategory = this.getParams("tbCategory");
            if(tbCategory && String(tbCategory.categoryId) != String(catId)){
                log.info("update draft catId is", catId);
                this.setParams("tbCategory", {"categoryId" : catId, "categoryName" : ""});
            }
        }
    }

    async fixRequiredData(draftData: { [key: string]: any }, skuItem: DoorSkuDTO, commonData: { [key: string]: any }){
        const aiFillSupport = new AiFillSupport(this.getParams("skuSource"));
        await aiFillSupport.checkCatPropAndFix(draftData, skuItem, commonData);
        const components = commonData.data.components;
        for(const key in components){
            const component = components[key];
            if(!('props' in component)){
                continue;
            }
            
            
            const props = component.props;
            if(!("required" in props)){
                continue;
            }
            const required = props.required;
            if(!required){
                continue;
            }
            if(props.name in this.fixRequiredDataHandler){
                this.fixRequiredDataHandler[props.name](props, draftData, this);
            }
        }
        await this.fillRequiredData(commonData, draftData);

    }

    public isRollBack(): boolean {
        return true;
    }  

    async fillRequiredData(commonData : { [key : string] : any }, draftData : { [key : string] : any }){
        const components = commonData.data.components;
        const dataSources = components.catProp?.props?.dataSource;
        if(!dataSources){
            return;
        }
        const draftCatProp = draftData.catProp;
        for(const dataSource of dataSources){
            const required = dataSource.required;
            if(!required){
                continue;
            }
            const draftCatPropValue = draftCatProp[dataSource.name];
            if(draftCatPropValue){
                if(Array.isArray(draftCatPropValue) && draftCatPropValue.length > 0){
                    continue;
                }
                if(String(draftCatPropValue).length > 0){
                    continue;
                }
            }
            if(dataSource.label.includes("净含量")){
                draftCatProp[dataSource.name] = "20g";
            }
            const catPropDataSource = dataSource.dataSource;
            if(!catPropDataSource){
                log.info("catPropDataSource is null", dataSource.name);
                continue;
            }
            draftCatProp[dataSource.name] = catPropDataSource[0];
        }
    }

    validateDraftData(draftData: { [key: string]: any }, skuItem: SkuItem, commonData: { [key: string]: any }){
        const components = commonData.data.components;
        let validateResult = true;
        let message = "";
        for(const key in components){
            if(this.fileterKey.includes(key)){
                continue;
            }
            const component = components[key];
            if(!('props' in component)){
                continue;
            }
            const props = component.props;
            if(!("required" in props)){
                continue;
            }
            const required = props.required;
            if(!required){
                continue;
            }
            const value = draftData[key];
            if(!value){
                message += key + ",";
                validateResult = false;
                continue;
            }
            if(typeof value === "string"){
                if(value.trim() === ""){
                    validateResult = false;
                    message += key + ",";
                    continue;
                }
            }
            if(typeof value === "number"){
                if(value === 0){
                    validateResult = false;
                    message += key + ",";
                    continue;
                }
            }
            if(typeof value === "object"){
                if(Object.keys(value).length === 0){
                    validateResult = false;
                    message += key + ",";
                    continue;
                }
            }
        }
        return {
            validateResult,
            message : message + "不能为空"
        };
    }

}