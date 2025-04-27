import { PxxLoginMonitor } from "@src/door/monitor/pxx/login/pxx.login.monitor";
import { PxxEngine } from "@src/door/pxx/pxx.engine";
import log from "electron-log";
import { MonitorPxxSkuApi } from "@eleapi/door/sku/pxx.sku";
import { InvokeType, Protocols } from "@eleapi/base";
import { BrowserContext, Page } from "playwright-core";
import { getUrlParameter } from "@utils/url.util";
import { getDoorRecord, saveDoorRecord, parseSku } from "@api/door/door.api";
import { DoorRecord } from "@model/door/door";
import { PDD } from "@enums/source";
import * as path from 'path';
import { app } from 'electron';
import fs from 'fs'
import { shell } from 'electron';
import { GatherSku, GatherSkuCreateReq } from "@model/gather/gather-sku";
import { addGatherSku } from "@api/gather/gather-sku.api";

const monitor = new PxxLoginMonitor();

const monitorConfig : {[key : number] : any} = {};


export class MonitorPddSku extends MonitorPxxSkuApi {
    
    private currentPage: Page | null = null;
    
    @InvokeType(Protocols.INVOKE)
    async monitorSku(gatherBatchId: number){
        log.info("open pxx resourceId is ", gatherBatchId);
        const resourceId = 11111;
        try{
            const engine = new PxxEngine(resourceId, false);
            const url = "https://mobile.yangkeduo.com/";
            const page = await engine.init(url);
            if(!page){ 
                return;
            }
            this.currentPage = page;
            const context = engine.getContext();
            monitor.setMonitorTimeout(60000);
            let loginResult = false;
            monitor.setHandler(async (request : any, response) => {
                const header = await request?.allHeaders();
                log.info("login monitor request ", header);
                loginResult = true;
                engine.saveContextState();
                return { "loginResult": true };
            });
            log.info("open wait monitor");
            const result = await engine.openWaitMonitor(page, url, monitor, {});
            if(result){
                this.saveSku(gatherBatchId, context, monitor.getType());
            }
            return result;
        } catch(error){
            log.error("login error", error);
        }
    }

    saveSku(resourceId : number, context : BrowserContext|undefined, type : string){
        if(!context || monitorConfig[resourceId]){
            return;
        }
        log.info("context on page ");
        const monitorKey = "PxxSkuMonitor";
        context.on("response", async response => {
            const request = response.request();
            const requestUrl = request.url();
            if(requestUrl.includes("goods.html?goods_id")){
                const requestParams = getUrlParameter(requestUrl);
                const goodsId = requestParams.get("goods_id");
                if(!goodsId){
                    return;
                }
                const responseData = await response.text();
                const match = responseData.match(/window\.rawData\s*=\s*({.*})/);
                if(match){
                    let rawData = match[0];
                    rawData = rawData.substring(rawData.indexOf("{"), rawData.length);
                    this.saveByJson(rawData, requestUrl, monitorKey, goodsId, type);
                    this.saveGatherSku(resourceId, goodsId, rawData);  // 保存采集商品
                } else {
                    log.info("row data not found");
                }
            }
        });
        monitorConfig[resourceId] = true;
    }

    saveByJson(rawData : string, url : string, doorKey : string, itemKey : string, type : string){
        try{
            const jsonData = JSON.parse(rawData);
            const initDataObj = jsonData?.store?.initDataObj;
            if(!initDataObj){
                log.warn(itemKey, " initDataObj not found");
                return;
            }
            const status = initDataObj?.goods?.status;
            log.info(itemKey, " status is ", status);
            if(!status || status != 1){
                return;
            }
            const doorRecord = new DoorRecord(undefined, doorKey, url, itemKey, type, JSON.stringify(initDataObj));
            saveDoorRecord(doorRecord);
            log.info("save door record success ", itemKey);
        } catch(error){
            log.error("save by json error ", error);
        }
    }


    async saveGatherSku(gatherBatchId : number, itemKey : string, rawData : string){
        const jsonData = JSON.parse(rawData);
        const initDataObj = jsonData?.store?.initDataObj;
        if(!initDataObj){
            log.warn(`${itemKey} initDataObj not found`);
            return;
        }

        // 保存页面的静态HTML
        await this.saveCurrentPageHtml(itemKey);

        // 解析商品信息
        parseSku(PDD, initDataObj).then(doorSkuDTO => {
            if(!doorSkuDTO){
                log.warn(`${itemKey} doorSkuDTO not found`);
                return;
            }

            // 保存采集商品
            const gatherSkuCreateReq = new GatherSkuCreateReq(gatherBatchId, doorSkuDTO.baseInfo.title, PDD, doorSkuDTO.doorSkuSaleInfo.saleNum, doorSkuDTO.doorSkuSaleInfo.price, doorSkuDTO.baseInfo.itemId, false);
            addGatherSku(gatherSkuCreateReq).then(gatherSku => {
                // 发送采集商品消息
                this.send('onGatherSkuMessage', gatherSku);
            });
        });
    }

    private async saveCurrentPageHtml(itemKey: string): Promise<void> {
        try {
            if (!this.currentPage) {
                log.warn(`Cannot save HTML: no current page available for item ${itemKey}`);
                return;
            }
            
            // 方法1: 使用content()方法获取HTML
            const htmlContent = await this.currentPage.content();
            
            // 生成文件名
            const fileName = `pdd_${itemKey}.html`;
            const userDataPath = app.getPath('userData');
            
            // 构建文件保存路径
            const saveDir = path.join(userDataPath, 'resource', 'gather', 'pdd');
            if(!fs.existsSync(saveDir)){
                fs.mkdirSync(saveDir, { recursive: true });
            }
            const filePath = path.join(saveDir, fileName);
            
            // 写入文件
            log.info("save html to ", filePath);
            fs.writeFileSync(filePath, htmlContent);
            
            // 同时截取屏幕截图作为备份
            await this.captureScreenshot(itemKey);
            
            log.info(`Successfully saved HTML for item ${itemKey} to ${filePath}`);
        } catch (error) {
            log.error(`Error saving HTML for item ${itemKey}:`, error);
        }
    }
    
    /**
     * 获取页面截图并保存
     */
    private async captureScreenshot(itemKey: string): Promise<void> {
        try {
            if (!this.currentPage) {
                return;
            }
            
            const userDataPath = app.getPath('userData');
            const screenshotDir = path.join(userDataPath, 'resource', 'gather', 'screenshots');
            if(!fs.existsSync(screenshotDir)){
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            
            const screenshotPath = path.join(screenshotDir, `pdd_${itemKey}.png`);
            await this.currentPage.screenshot({ path: screenshotPath, fullPage: true });
            log.info(`Captured screenshot for item ${itemKey}`);
        } catch (error) {
            log.error(`Error capturing screenshot for item ${itemKey}:`, error);
        }
    }

    /**
     * 检查本地HTML文件是否存在
     */
    @InvokeType(Protocols.INVOKE)
    async checkLocalHtmlExists(source: string, itemKey: string): Promise<boolean> {
        try {
            const userDataPath = app.getPath('userData');
            let fileName = '';
            let sourceDir = '';

            if (source === PDD) {
                fileName = `pdd_${itemKey}.html`;
                sourceDir = path.join(userDataPath, 'resource', 'gather', 'pdd');
            } else if (source === 'TB') {
                fileName = `taobao_${itemKey}.html`;
                sourceDir = path.join(userDataPath, 'resource', 'gather', 'taobao');
            } else {
                return false;
            }

            const filePath = path.join(sourceDir, fileName);
            
            // 检查文件是否存在
            return fs.existsSync(filePath);
        } catch (error) {
            log.error('Error checking local HTML file:', error);
            return false;
        }
    }

    /**
     * 打开本地HTML文件
     */
    @InvokeType(Protocols.INVOKE)
    async openLocalHtmlFile(source: string, itemKey: string): Promise<boolean> {
        try {
            const userDataPath = app.getPath('userData');
            let fileName = '';
            let sourceDir = '';

            if (source === PDD) {
                fileName = `pdd_${itemKey}.html`;
                sourceDir = path.join(userDataPath, 'resource', 'gather', 'pdd');
            } else if (source === 'TB') {
                fileName = `taobao_${itemKey}.html`;
                sourceDir = path.join(userDataPath, 'resource', 'gather', 'taobao');
            } else {
                return false;
            }

            const filePath = path.join(sourceDir, fileName);
            
            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
                // 使用系统默认应用打开文件
                return shell.openPath(filePath).then(error => {
                    if (error === '') {
                        log.info(`Successfully opened ${filePath}`);
                        return true;
                    } else {
                        log.error(`Error opening file: ${error}`);
                        return false;
                    }
                });
            }
            
            return false;
        } catch (error) {
            log.error('Error opening local HTML file:', error);
            return false;
        }
    }
}
