import axios from "axios";
import { StepResult, StepUnit } from "../../step.unit";
import log from "electron-log"
import { AbsPublishStep } from "./abs.publish";
import { MbEngine } from "@src/door/mb/mb.engine";
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { getDoorCatProps, getDoorCatPropsByAI, saveDoorCatProp } from "@api/door/door.api";
import { DoorSkuCatProp } from "@model/door/door";
import { FoodSupport } from "../fill.food";



const excludeCatProp = ["p-20000"];

const aiFillCategoryCode = ["p-20000-226407184"]




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
            await this.fixRequiredData(draftData, skuItem, commonData);
            const foodSupport = new FoodSupport();
            const foodResult = foodSupport.doFill(commonData.data.components, skuItem.baseInfo.skuItems, draftData);
            if(!foodResult){
                return new StepResult(false, foodSupport.fillMessage);
            }
            const validateResult = this.validateDraftData(draftData, skuItem, commonData);
            if(!validateResult.validateResult){
                return new StepResult(false, validateResult.message);
            }
            const updateResult = await this.updateDraftData(catId, draftId, requestHeader, startTraceId, draftData);
            if(!updateResult){
                return new StepResult(false, "更新草稿失败");
            }
            return new StepResult(true, "更新草稿成功");
        } catch (error) {
            log.error("UpdateDraftStep error", error);
            return new StepResult(false, "更新草稿失败");
        }finally{
            await engine.closePage();
            const page = this.getParams("page");
            if(page){
                console.log("cache page is not null");
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

    async isFood(commonData : { [key : string] : any }){

    }


    async fixInputByAI(draftData : { [key : string] : any }, skuItem : DoorSkuDTO, params : { [key : string] : any }){
        if(Object.keys(params).length == 0){
            return;
        }
        const properties : {[key : string] : any}[] = [];
        for(const key in params){
            properties.push({
                "label" : params[key],
                "code" : key
            })
        }
        const requestAiParams =
            {
            "sence_name" : "fill_category",
            "params" : {
                "title" : skuItem.baseInfo.title,
                "properties" : properties
            }
        }
        log.info("fixInputByAI requestAiParams is", requestAiParams);
        const aiResult : any[] = await getDoorCatPropsByAI(requestAiParams);
        if(aiResult && aiResult.length > 0){
            const doorCatProps : DoorSkuCatProp[] = [];
            for(const aiProp of aiResult){
                let aiValue = aiProp.value;
                if(typeof aiValue != "string"){
                    aiValue = JSON.stringify(aiValue);
                }
                draftData.catProp[aiProp.code] = aiProp.value;

                doorCatProps.push({
                    "id" : undefined,
                    "source" : this.getParams("skuSource"),
                    "itemKey" : skuItem.baseInfo.itemId,
                    "propKey" : aiProp.code,
                    "propValue" : aiValue
                })
            }
            await saveDoorCatProp(doorCatProps);
        }
    }

    checkCatProp(draftCatPropValue : { [key : string] : any }, dataSource : { [key : string] : any }[]){
        for(const item of dataSource){
            if(item.value == draftCatPropValue.value){
                return true;
            }
        }
        return false;
    }

    buildNewDataSource(label : string, dataSource : { [key : string] : any }[]){
        const newDataSource : { [key : string] : any }[] = [];
        for(const item of dataSource){
            newDataSource.push({
                "code" : item.value,
                "correct_value" : item.text
            });
        }
        return {
            "label" : label,
            "data" : newDataSource
        };
    }

    buildFixCatPropAndInputParams(draftData : { [key : string] : any }, commonData : { [key : string] : any }){
        const catPropDataSource = commonData.data.models.catProp.dataSource;
        const fixInputParams : {[key : string] : any} = {};
        const fixCatProp : {[key : string] : any} = {};
        const draftCatProp = draftData.catProp;
        for(const catProp of catPropDataSource){
            const propKey = catProp.name;
            if(excludeCatProp.includes(propKey)){
                continue;
            }
            const draftCatPropValue = draftCatProp[propKey];
            if(draftCatPropValue){
                const dataSource = catProp.dataSource;
                if(!dataSource){
                    continue;
                }
                let checkResult = this.checkCatProp(draftCatPropValue, dataSource);
                if(checkResult){
                    continue;
                }
                log.info("draftCatPropValue is  ", catProp);
                fixCatProp[propKey] = this.buildNewDataSource(catProp.label, dataSource);
                continue;
            }
            if(catProp.required) {
                log.info("fixCatProp is required ", catProp);
                const dataSource = catProp.dataSource;
                if(dataSource){
                    fixCatProp[propKey] = this.buildNewDataSource(catProp.label, dataSource);
                }
                const uiType = catProp.uiType;
                if(uiType == 'input' || aiFillCategoryCode.includes(catProp.name)){
                    fixInputParams[catProp.name] = catProp.label;
                }
            }
        }
        log.info("fixInputParams is", fixInputParams);
        log.info("fixCatProp is", fixCatProp);
        return {
            fixInputParams,
            fixCatProp
        }

    }

    async getDoorSkuCatProps(fixInputParams : {[key : string] : any}, fixCatProp : {[key : string] : any}, itemId : string){
        if(Object.keys(fixInputParams).length == 0 && Object.keys(fixCatProp).length == 0){
            return [];
        }
        return await getDoorCatProps(this.getParams("skuSource"), itemId);
    }

    async checkCatPropAndFix(draftData : { [key : string] : any }, skuItem : DoorSkuDTO, commonData : { [key : string] : any }){
        const {fixInputParams, fixCatProp} = this.buildFixCatPropAndInputParams(draftData, commonData);
        const doorSkuCatProps = await this.getDoorSkuCatProps(fixInputParams, fixCatProp, skuItem.baseInfo.itemId);
        if(Object.keys(fixInputParams).length > 0){
            for(const doorSkuCatProp of doorSkuCatProps){
                const propKey = doorSkuCatProp.propKey;
                draftData.catProp[propKey] = doorSkuCatProp.propValue;
                if(propKey in fixInputParams){
                    delete fixInputParams[propKey];
                }
            }
            await this.fixInputByAI(draftData, skuItem, fixInputParams);
        }
        if(Object.keys(fixCatProp).length > 0){
            for(const doorSkuCatProp of doorSkuCatProps){
                const propKey = doorSkuCatProp.propKey;
                draftData.catProp[propKey] = doorSkuCatProp.propValue;
                if(propKey in fixCatProp ){
                    delete fixCatProp[propKey];
                }
            }
            for(const propKey of excludeCatProp){
                if(propKey in fixCatProp){
                    delete fixCatProp[propKey];
                }
            }
            await this.fixDataSourceByAI(draftData, skuItem.baseInfo.itemId, fixCatProp);
        }
    }

    isValidJson(json : string){
        try {
            JSON.parse(JSON.stringify(json));
            return true; // 是有效的 JSON
        } catch (e) {
            return false; // 不是有效的 JSON
        }
    }

    buildTargetData(draftValue : any){
        if(draftValue == undefined){
            return {
                "value" : "",
            };
        }
        if(Array.isArray(draftValue)){
            for(const item of draftValue){
                if(this.isValidJson(item)){
                    return {
                        "value" : item.text,
                    };
                }
            }
        }
        if(this.isValidJson(draftValue)){
            return {
                "value" : draftValue.text,
            };
        }
        return {
            "value" : draftValue,
        };
    }

    async fixDataSourceByAI(draftData : { [key : string] : any }, itemId : string, fixCatProp : {[key : string] : any}){
        if(Object.keys(fixCatProp).length == 0){
            return;
        }
        const draftCatProp = draftData.catProp;
        const requestAiParams : {[key : string] : any}[] = [];

        for(const propKey in fixCatProp){
            const catProp = fixCatProp[propKey];
            const draftValue = draftCatProp[propKey];
            requestAiParams.push({
                "label" : catProp.label,
                "pid" : propKey,
                "ori_data" : catProp.data,
                "target_data" : this.buildTargetData(draftValue)
            })
        }
        const params ={
            "sence_name" : "switch_value",
            "params" : {
                "data" : requestAiParams
            }
        }
        log.info("fixDataSourceByAI requestAiParams is", JSON.stringify(params));
        const aiResult : any[] = await getDoorCatPropsByAI(params);
        if(aiResult && aiResult.length > 0){
            const doorCatProps : DoorSkuCatProp[] = [];

            for(const aiProp of aiResult){
                const propKey = aiProp.pid;
                const aiPropValue = aiProp.target_data;
                const aiDraftValue = {
                    "value" : aiPropValue.code,
                    "text" : aiPropValue.value
                }
                draftData.catProp[propKey] = aiDraftValue;
                doorCatProps.push({
                    "id" : undefined,
                    "source" : this.getParams("skuSource"),
                    "itemKey" : itemId,
                    "propKey" : propKey,
                    "propValue" : JSON.stringify(aiDraftValue)
                })
            }
            await saveDoorCatProp(doorCatProps);
        }
    }

    async fixRequiredData(draftData: { [key: string]: any }, skuItem: DoorSkuDTO, commonData: { [key: string]: any }){
        await this.checkCatPropAndFix(draftData, skuItem, commonData);
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