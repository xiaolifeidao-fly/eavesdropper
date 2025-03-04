import axios from "axios";
import { StepResult, StepUnit } from "../../step.unit";
import log from "electron-log"
import { AbsPublishStep } from "./abs.publish";
import { MbEngine } from "@src/door/mb/mb.engine";
import { SkuItem } from "@model/door/sku";







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
        log.info("fixMultiDiscountPromotion", fieldPros);
        const dataSources = fieldPros.dataSource;
        if(!dataSources){
            return;
        }
        const dataSource = dataSources[0];
        if(!dataSource){
            return;
        }
        log.info("dataSource is", dataSource);
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
            const requestHeader = this.getHeader(); 
            if(!requestHeader){
                log.error("requestHeader is null");
                return new StepResult(false, "获取请求头失败");
            }
            await this.fillCategoryList(skuItem, draftData, commonData, requestHeader, catId, startTraceId);
            this.fixRequiredData(draftData, skuItem, commonData);
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

    fixRequiredData(draftData: { [key: string]: any }, skuItem: SkuItem, commonData: { [key: string]: any }){
        const catPropDataSource = commonData.data.models.catProp.dataSource;
        for(const catProp of catPropDataSource){
            if(catProp.required) {
                log.info(catProp.lable," catProp is required name is ", catProp.name);
            }
        }
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