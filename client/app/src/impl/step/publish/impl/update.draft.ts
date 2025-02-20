import axios from "axios";
import { StepResult, StepUnit } from "../../step.unit";
import log from "electron-log"
import { AbsPublishStep } from "./abs.publish";
import { MbEngine } from "@src/door/mb/mb.engine";
import { SkuItem } from "@model/door/sku";

export class UpdateDraftStep extends AbsPublishStep {

    async getPage(engine: MbEngine<any>, draftId: string){
        const newPage = await engine.init();
        if(!newPage){
            log.error("newPage is null");
            return null;
        }
        await newPage.goto("https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId);
        return newPage;
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

    validateDraftData(draftData: { [key: string]: any }, skuItem: SkuItem, commonData: { [key: string]: any }){
        const components = commonData.data.components;
        for(const key in components){
            const component = components[key];
            if(!('props' in component)){
                continue;
            }
            const props = component.props;
        }
        return true;
    }

}