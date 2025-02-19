import { MbEngine } from "@src/door/mb/mb.engine";
import { StepResult } from "../../step.unit";
import { AbsPublishStep, confirmProtocol } from "./abs.publish";
import log from "electron-log"
import { MbSkuPublishMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { Page } from "playwright-core";
import axios from "axios";
import { expireSkuDraft } from "@api/sku/sku.draft";

async function clickPublishButtonByPage(page: Page, ...doActionParams: any[]){
    try {
        await confirmProtocol(page);
    } catch (e) {
        log.info("confirmProtocol error", e);
    }
    log.info("clickPublishButton start ");
    const publishButton = await page.locator("button[_id='button-submit']").first();
    await publishButton.click();
    log.info("clickPublishButton end ");
}

export class PublishSkuStep extends AbsPublishStep {

    async doStep(): Promise<StepResult> {
        const draftId = this.getParams("draftId");
        const resourceId = this.getParams("resourceId");
        console.log("PublishSkuStep resourceId is ", resourceId);
        console.log("PublishSkuStep draftId is ", draftId);
        const engine = new MbEngine(resourceId, false);
        const newPage = await engine.init();
        if(!newPage){
            log.info("newPage is null");
            return new StepResult(false, "发布商品界面加载失败");
        }
        try{
            const url = "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId;
            const newResult = await engine.openWaitMonitor(newPage, url, new MbSkuPublishMonitor(), {}, clickPublishButtonByPage);
            if(!newResult){
                log.info("newResult is null");
                return new StepResult(false, "发布商品获取数据失败");
            }
            const responseData = newResult.getData();
            log.info("responseData is ", responseData);
            const type = responseData.models?.globalMessage?.type;
            if(!type){
                log.info("publish is error by ", responseData);
                return new StepResult(false, "发布商品失败");
            }
            if(type == "error"){
                log.info("publish is error by ", JSON.stringify(responseData));
                return new StepResult(false, "发布商品失败");
            }
            if(type == "success"){
                const deleteResult = await this.deleteDraft(draftId);
                if (!deleteResult) {
                    log.info("deleteDraft failed ", deleteResult);
                    return new StepResult(false, "删除草稿失败");
                }
                const itemId = this.getParams("itemId");
                await expireSkuDraft(resourceId, itemId);
                return new StepResult(true, "发布商品成功");
            }
            return new StepResult(false, "发布商品失败");
        }catch(e){
            log.info("confirmProtocol error", e);
            return new StepResult(false, "发布商品发生未知异常");
        } finally{
            await engine.closePage();
        }
    }

    async deleteDraft(draftId: string) {
        const catId = this.getParams("catId");
        const startTraceId = this.getParams("startTraceId");
        const url = "https://item.upload.taobao.com/sell/draftOp/delete.json?catId=" + catId + "&dbDraftId=" + draftId;
        const data = {
            "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
        };
    
        const res = await axios.post(url, data, {
            headers: this.getHeader()
        })
        if (!res.data || (typeof (res.data) == 'string' && res.data == '')) {
            log.info("delete draft res is empty", res.data);
            return false;
        }
        if (!res.data.success) {
            log.info("delete draft res is not success ", res.data);
            return false;
        }
        return true;
    }
    
}

