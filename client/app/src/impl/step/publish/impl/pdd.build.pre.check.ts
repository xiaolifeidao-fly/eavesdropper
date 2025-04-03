import { MbEngine } from "@src/door/mb/mb.engine";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";
import { AbsPublishStep, confirmProtocol } from "./abs.publish";
import { activeSkuDraft, getSkuDraft } from "@api/sku/sku.draft";
import { MbSkuPublishDraffMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { Page } from "playwright-core";
import log from "electron-log"
import { SkuFileDetail } from "@model/sku/sku.file";
import { DoorEntity } from "@src/door/entity";
import { DoorSkuDTO, SkuItem } from "@model/door/sku";
import { PriceRangeConfig } from "@model/sku/skuTask";
import axios from "axios";
import { getOrSaveTemplateId } from "@src/door/mb/logistics/logistics";
import { getUrlParameter } from "@utils/url.util";

async function doAction(page: Page, ...doActionParams: any[]) {
    await page.waitForTimeout(1000);
    await confirmProtocol(page);
    await clickSaveDraf(page);
}

async function clickSaveDraf(page: Page) {
    // 保存草稿
    await page.locator(".sell-draft-save-btn button").click();
}

const validateMap :{ [key: string]: (props: { [key: string]: any }) => {result: boolean, message: string} } = {
    "qualification": validateQualification
}

function validateQualification(props: { [key: string]: any }){
    const requiredModule = props.dataSource?.requiredModule;
    if(requiredModule && Object.keys(requiredModule).length > 0){
        return {result: false, message: "请上传商品资质"};
    }
    return {result: true, message: ""};
}

export class SkuPddBuildPreCheckStep extends AbsPublishStep{


    async doStep(): Promise<StepResult> {
        const category = this.getParams("tbCategory");
        log.info("category is ", category);
        if(!category || !category.categoryId || category.categoryId == ""){
            const stepResult = new StepResult(true, "获取商品分类失败") ;
            stepResult.setNeedNextSkip(true);
            return stepResult;
        }
        const resourceId = this.getParams("resourceId");
        const skuItem = this.getParams("skuItem");
        const mbEngine = new MbEngine(resourceId);
        try {
            const page = await mbEngine.init();
            if (!page) {
                return new StepResult(false, "打开发布页面失败") ;
            }
            const itemId = skuItem.baseInfo.itemId;
            const tbItemId = skuItem.itemId;
            let skuDraftId = await this.getSkuDraftIdFromDB(resourceId, itemId);
            let url = this.getPublishUrl(category, skuDraftId, tbItemId);
            log.info("check publish url is ", url);
            await page.goto(url);
            let commonData = await this.getJsonData(page);
            const result = this.check(commonData);
            log.info("check result is ", result);
            if(!result.result){
                const stepResult = new StepResult(true, result.message) ;
                stepResult.setNeedNextSkip(true);
                return stepResult;
            }
            return new StepResult(true, "前置校验成功") ;
        } catch (error) {
            log.error(error);
            return new StepResult(false, "前置校验失败") ;
        }
    }

    
    async getJsonData(page: Page) {
        // 获取window对象中 json 数据 
        const commonData = await page.evaluate(() => {
            return {
                // @ts-ignore
                data: window.Json,
                // @ts-ignore
                userAgent: navigator.userAgent
            };
        });
        return commonData;
    }


    check(commonData : { [key: string]: any }){
        const fields =  commonData.data.models.__fields__;
        const componentsData = commonData.data.components;
        for(const field in fields){
            const props = this.getProps(componentsData, field);
            if(!props || props.length == 0){
                continue;
            }
            const result = this.checkProp(props);
            if(!result.result){
                return result;
            }
        }
        return {result: true, message: ""};
    }

    checkProp(props: { [key: string]: any }){

        const name = props.name;
        if(name in validateMap){
            return validateMap[name](props);
        }
        return {result: true, message: ""};
    }

    getProps(componentsData: { [key: string]: any }, field: string){
        if (!(field in componentsData)){
            for(const key in componentsData){
                const fieldData = componentsData[key];
                const props = fieldData.props;
                if(!props || props.length == 0){
                    continue;
                }
                return props;
    
            }
            return undefined;
        }
        const fieldData = componentsData[field];
        return fieldData.props;
    }


    getPublishUrl(category: { [key: string]: any }, skuDraftId: string | undefined, itemId: string) {
        const url = "https://item.upload.taobao.com/sell/v2/publish.htm?catId=" + category.categoryId;
        return url;
    }

}