import { MbEngine } from "@src/door/mb/mb.engine";
import { StepResult } from "../../step.unit";
import { AbsPublishStep, confirmProtocol } from "./abs.publish";
import log from "electron-log"
import { MbSkuPublishMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { Page } from "playwright-core";
import axios from "axios";
import { expireSkuDraft } from "@api/sku/sku.draft";
import { DoorSkuDTO } from "@model/door/sku";
import { saveDoorCategory } from "@api/door/door.api";
import { DoorCategory } from "@model/door/door";

async function clickPublishButtonByPage(page: Page, ...doActionParams: any[]){
    await confirmProtocol(page);
    await fillMultiDiscountPromotion(page, doActionParams[0]);
    await publishSkuByPage(page);
}

async function fillMultiDiscountPromotion(page: Page, multiDiscountPromotionValue : string) {
    if(!multiDiscountPromotionValue || multiDiscountPromotionValue == ""){
        return;
    }
    await page.waitForTimeout(1000);
    const multiDiscountPromotionElement = await page.evaluate(() => {
        //@ts-ignore
        const doc = document.querySelectorAll(".sell-component-multi-discount-promotion .next-checkbox-input");
        if(!doc || doc.length == 0){
            return false;
        }
        return true;
    });
    if(!multiDiscountPromotionElement){
        log.info("multiDiscountPromotionElement not found");
        return;
    }
    const multiDiscountPromotion = page.locator(".sell-component-multi-discount-promotion .next-checkbox-input");
    await multiDiscountPromotion.waitFor({timeout:2000});
    if(multiDiscountPromotion){
        await multiDiscountPromotion.first().click();
        const input = page.locator(".sell-component-multi-discount-promotion .next-input-group-auto-width input").first();
        await input.fill(multiDiscountPromotionValue);
        console.log("fillMultiDiscountPromotion", multiDiscountPromotionValue);
        await page.waitForTimeout(100);
    }
}

async function publishSkuByPage(page: Page, ...doActionParams: any[]){
    try{
        log.info("clickPublishButton start ");
        const publishButton = page.locator("button[_id='button-submit']").first();
        await publishButton.click();
        await page.waitForTimeout(2000);
        const elementSelector = ".next-btn.next-medium.next-btn-primary.next-dialog-btn";
        if(elementSelector){
            const directPublishButton = page.locator(elementSelector).first();
            await directPublishButton.click();
        }
        log.info("clickPublishButton end ");
    } catch (e) {
        log.info("publishSkuByPage error", e);
    }
}

export class PublishSkuStep extends AbsPublishStep {

    override isRollBack() : boolean{
        return true;
    }

    async publishByPage(){
        const draftId = this.getParams("draftId");
        const resourceId = this.getParams("resourceId");
        const engine = new MbEngine(resourceId);
        const newPage = await engine.init();
        if(!newPage){
            log.info("first init newPage is null");
            return new StepResult(false, "发布商品界面加载失败");
        }
        try{
            const url = "https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId;
            const multiDiscountPromotionValue = this.getParams("multiDiscountPromotionValue");
            const newResult = await engine.openWaitMonitor(newPage, url, new MbSkuPublishMonitor(), {}, clickPublishButtonByPage, multiDiscountPromotionValue);
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
                const message = responseData.models?.formError?.tbExtractWay?.itemMessage?.template?.message;
                if(message && message.length > 0){
                    const msg = message[0].msg;
                    return new StepResult(false, msg);
                }
                return new StepResult(false, "发布商品失败");
            }
            if(type == "warning"){
                const message = responseData.models?.warning?.diagnoseViolationWarning?.tipsContent
                log.info("publish is warning by ", JSON.stringify(responseData));
                return new StepResult(false, message);
            }
            if(type == "success"){
                const successUrl = responseData.models?.globalMessage?.successUrl;
                if(successUrl){
                    const primaryIdMatch = successUrl.match(/primaryId=(\d+)/);
                    let primaryId = null;
                    if (primaryIdMatch && primaryIdMatch[1]) {
                        primaryId = primaryIdMatch[1];
                        this.setParams("newSkuId", primaryId);
                    }
                }
                await this.saveSkuCategory(this.getParams("skuItem"));
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

   

    async doStep(): Promise<StepResult> {
        const resourceId = this.getParams("resourceId");
        const draftId = this.getParams("draftId");
        try{
            const catId = this.getParams("catId");
            const startTraceId = this.getParams("startTraceId");
            const updateDraftData = this.getParams("updateDraftData");
            const draftHeader = this.getParams("draftHeader");
            const stepResult = await this.submit(catId, startTraceId, updateDraftData, draftHeader, draftId);
            if(stepResult.result){
                await this.saveSkuCategory(this.getParams("skuItem"));
            }
            return stepResult;
        } catch (e) {
            log.error("publishSkuStep error", e);
            return new StepResult(false, "发布商品失败");
        }finally{
            await this.releaseDraftData(draftId, resourceId);
        }
    }

    getErrorMessage(responseData : any){
        let errorMessage = responseData.models?.formError?.tbExtractWay?.itemMessage?.template?.message;
        if(errorMessage && errorMessage.length > 0){
            return errorMessage[0]?.msg;
        }
        errorMessage = responseData.models?.globalMessage?.message;
        if(errorMessage && errorMessage.length > 0){
            return errorMessage[0]?.msg;
        }
        errorMessage = responseData.models?.formError?.tbExtractWay?.message;
        if(errorMessage && errorMessage.length > 0){
            return errorMessage[0]?.msg;
        }
        errorMessage = responseData.models?.formError?.price?.message;
        if(errorMessage && errorMessage.length > 0){
            return errorMessage[0]?.msg;
        }
        return JSON.stringify(responseData);
    }

    async submit(catId : string, startTraceId : string, updateDraftData : any, draftHeader : any, draftId : string){
        try{
            updateDraftData['fakeCreditSubmit'] = true;
            log.info("submit updateDraftData is ", JSON.stringify(updateDraftData));
            const url = "https://item.upload.taobao.com/sell/v2/submit.htm";
            const data = {
                "catId": catId,
                "jsonBody": JSON.stringify(updateDraftData),
                "copyItemMode": 0,
                "globalExtendInfo": JSON.stringify({ "startTraceId": startTraceId })
            };
            const res = await axios.post(url, data, {
                headers: draftHeader
            })
            const responseData = res.data;
            log.info("responseData is ", responseData);
            const type = responseData.models?.globalMessage?.type;
            if(!type){
                log.info("publish is error by ", responseData);
                return new StepResult(false, "发布商品失败");
            }
            if(type == "error"){
                log.info("publish is error by ", JSON.stringify(responseData));
                const errorMessage = this.getErrorMessage(responseData);
                return new StepResult(false, errorMessage);
            }
            if(type == "warning"){
                const message = responseData.models?.warning?.diagnoseViolationWarning?.tipsContent
                log.info("publish is warning by ", JSON.stringify(responseData));
                return new StepResult(false, message);
            }
            if(type == "success"){
                const deleteResult = await this.deleteDraft(draftId);
                if (!deleteResult) {
                    log.info("deleteDraft failed ", deleteResult);
                    return new StepResult(false, "删除草稿失败");
                }
                const successUrl = responseData.models?.globalMessage?.successUrl;
                if(successUrl){
                    const primaryIdMatch = successUrl.match(/primaryId=(\d+)/);
                    let primaryId = null;
                    if (primaryIdMatch && primaryIdMatch[1]) {
                        primaryId = primaryIdMatch[1];
                        this.setParams("newSkuId", primaryId);
                    }
                }
                return new StepResult(true, "发布商品成功");
            }
            return new StepResult(false, "发布商品失败");
        }catch(e){
            log.error("submit draftData error ", e);
            return new StepResult(false, "发布商品失败");
        }

    }

    async saveSkuCategory(skuItem : DoorSkuDTO){
        let tbCategory = this.getParams("tbCategory");
        if(tbCategory){
            const catId = this.getParams("catId");
            const doorCategory = new DoorCategory(undefined, skuItem.baseInfo.catId, catId, tbCategory.categoryName);
            log.info(" saveDoorCategory info ", doorCategory);
            await saveDoorCategory(doorCategory);
        }
    }

   
    
}

