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
import { app, BrowserView, session } from 'electron';
import fs from 'fs'
import { shell } from 'electron';
import { GatherSku, GatherSkuCreateReq } from "@model/gather/gather-sku";
import { addGatherSku, getGatherSkuByID } from "@api/gather/gather-sku.api";
import { BrowserWindow } from 'electron';
import { setGatherToolWindow, getGatherToolWindow, setGatherWindow, getGatherWindow, setPxxDetailWindow, getPxxDetailWindow, setGatherToolView, getGatherToolView, setGatherPreviewView, getGatherPreviewView } from '@src/kernel/windows'
import { get } from "@utils/store/electron";
import { getPlatform, getSecChUa } from "@src/door/engine";

const PDD_URL = "https://mobile.yangkeduo.com/goods1.html?goods_id=";

const monitor = new PxxLoginMonitor();

const monitorConfig : {[key : number] : any} = {};



export class MonitorPddSku extends MonitorPxxSkuApi {
    
    private readonly width = 450;
    private readonly borderWidth = 200;

    sendMessage(key : string, ...args: any){
        getGatherToolView()?.webContents.send(key, ...args);
    }

    async getPxxCode(){
        return `
        (async function() {
            function delay(fn, ms) {
                return new Promise(resolve => {
                    setTimeout(() => {
                    var result = fn();
                    resolve(result);
                    }, ms);
                });
            }

            function getContent(){
                const result = window.rawData;
                return result;
            }
            let times = 0;
            while(times < 20){
                var result = await delay(getContent,500);
                if(result){
                    return JSON.stringify(result);
                }
                times++;
            }
            return undefined;
      })();
        `;
    }

    async getPxxHtml(){
        return `
        (async function() {
            function delay(fn, ms) {
                return new Promise(resolve => {
                    setTimeout(() => {
                    var result = fn();
                    resolve(result);
                    }, ms);
                });
            }

            function getContent(){
                return document.documentElement.outerHTML;
            }
            return await delay(getContent,2000);
      })();
        `;
    }
    
    @InvokeType(Protocols.INVOKE)
    async goBack(){
        const webContents = getGatherWindow()?.webContents;
        if(webContents?.canGoBack()){
            webContents.goBack();
        }
    }

    @InvokeType(Protocols.INVOKE)
    async goHome(){
        const webContents = getGatherWindow()?.webContents;
        webContents.loadURL("https://mobile.yangkeduo.com/");
    }

    async createGatherToolView(gatherBatchId : number){
        const browserView = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                webviewTag: true, // 启用 webview 标签
                devTools: true,
                webSecurity: false,
                nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
            },
        });
        const gatherToolUrl = `${process.env.WEBVIEW_URL}/gather-tool?gatherBatchId=${gatherBatchId}`
        browserView.webContents.loadURL(gatherToolUrl)
        browserView.setBounds({ x: 0, y: 0, width: this.width, height: 1080}); // 设置大小和位置
        setGatherToolView(browserView);
        return browserView;
    }

    async createGatherPreviewView(url : string){
        const browserView = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                webviewTag: true, // 启用 webview 标签
                devTools: true,
                webSecurity: false,
                nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
            },
        });
        browserView.webContents.loadURL(url);
        const position = this.width * 2 + this.borderWidth + 20;
        browserView.setBounds({ x: position, y: 0, width: 1920 - position, height: 1080}); // 设置大小和位置
        // Add a title to the view by injecting CSS and HTML
        setGatherPreviewView(browserView);
        return browserView;
    }

    async createGatherWindow(resourceId : number, gatherBatchId : number) {
        // 主窗口
        const windowInstance = new BrowserWindow({
            width: 1920,
            height: 1080,
            webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webviewTag: true, // 启用 webview 标签
            devTools: true,
            webSecurity: false,
            nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
            }
        });

        windowInstance.addBrowserView(await this.createPddView(resourceId, gatherBatchId));
        windowInstance.addBrowserView(await this.createGatherToolView(gatherBatchId));
        const gatherToolUrl = `${process.env.WEBVIEW_URL}/gather-manage/preview?gatherBatchId=${gatherBatchId}`
        windowInstance.addBrowserView(await this.createGatherPreviewView(gatherToolUrl));
        // const gatherToolUrl = `${process.env.GATHER_WEBVIEW_URL}?gatherBatchId=${gatherBatchId}`
        // windowInstance.loadURL(gatherToolUrl)
        // windowInstance.webContents.openDevTools();
        setGatherToolWindow(windowInstance);
        windowInstance.on('closed', () => {
            const channel = this.buildKey("onGatherToolClosed");
            super.sendMessage(channel)
        })
        return windowInstance;
    }

    async createDetailWindow(url : string) {
        // const pxxDetailWindow = getPxxDetailWindow();
        // if(pxxDetailWindow && !pxxDetailWindow.isDestroyed()){
        //     pxxDetailWindow.show();
        //     pxxDetailWindow.loadFile(url);
        //     return;
        // }
        // // 主窗口
        // const windowInstance = new BrowserWindow({
        //     width: 1090-this.width,
        //     height: 1080,
        //     webPreferences: {
        //     preload: path.join(__dirname, 'preload.js'),
        //     contextIsolation: true,
        //     webviewTag: true, // 启用 webview 标签
        //     // devTools: true,
        //     webSecurity: false,
        //     nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
        //     }
        // });
        // setPxxDetailWindow(windowInstance);
        // windowInstance.loadFile(url);
        await getGatherPreviewView().webContents.loadFile(url);
    }


    async createPddView(resourceId : number, gatherBatchId : number){
        const pddHomeUrl = "https://mobile.yangkeduo.com/";
        const sessionInstance = session.fromPartition(`persist:-${resourceId}-session`, { cache: true });
        
        // const platform = await getPlatform();
        // const secChUa = getSecChUa(platform);
        // sessionInstance.webRequest.onBeforeSendHeaders(async (details,callback) => {
        //     const header = details.requestHeaders;
        //     if(platform){
        //         for(const key in header){
        //             const lowerKey = key.toLowerCase();
        //             if(lowerKey == "sec-ch-ua"){
        //                 header[key] = secChUa;
        //             }
        //             if(lowerKey == "sec-ch-ua-mobile"){
        //                 header[key] = "?0";
        //             }
        //             if(lowerKey == "sec-ch-ua-platform"){
        //                 header[key] = `"${platform?.userAgentData?.platform}"`;
        //             }
        //             if(lowerKey == 'user-agent'){
        //                 header[key] = platform?.userAgent;
        //             }
        //         }
        //     }
        //     callback({requestHeaders: header});
        // });


        sessionInstance.webRequest.onCompleted(async (details) => {
            const requestUrl = details.url;
            if(requestUrl.includes("goods_id=")){
                try{
                    this.send('onGatherToolLoaded', true);
                    const requestParams = getUrlParameter(requestUrl);
                    const goodsId = requestParams.get("goods_id");
                    if(!goodsId){
                        this.send('onGatherToolLoaded', false);
                        return;
                    }
                    const code = await this.getPxxCode();
                    const rawData = await getGatherWindow()?.webContents.executeJavaScript(code);
                    const monitorKey = "PxxSkuMonitor";
                    if(rawData){
                        await this.saveByJson(rawData, requestUrl, monitorKey, goodsId, PDD);
                        await this.saveGatherSku(gatherBatchId, goodsId, rawData);  // 保存采集商品
                    } else {
                        this.send('onGatherToolLoaded', false);
                        log.info("row data not found");
                    }
                }catch(error){
                    log.error("send onGatherToolLoaded error ", error);
                }
            }
        });
    
        // 创建 BrowserView
        const browserView = new BrowserView({
            webPreferences: {
                session: sessionInstance
            },
        });

        browserView.webContents.on('context-menu', (event, params) => {
            if (params.mediaType === 'image') {
                const { clipboard } = require('electron');
                const menu = require('electron').Menu.buildFromTemplate([
                    {
                        label: '复制图片地址',
                        click: () => {
                            clipboard.writeText(params.srcURL);
                        }
                    }
                ]);
                menu.popup();
            }
        });

        // 将 BrowserView 附加到主窗口
        browserView.setBounds({ x: this.width, y: 0, width: this.width + this.borderWidth, height: 1080}); // 设置大小和位置
        browserView.webContents.loadURL(pddHomeUrl);
        setGatherWindow(browserView);
        return browserView;
    }
    
    @InvokeType(Protocols.INVOKE)
    async monitorSku(resourceId: number, gatherBatchId : number){
        log.info("open pxx resourceId is ", resourceId);
        try{
            const engine = new PxxEngine(resourceId, false);
            // const url = "https://mobile.yangkeduo.com/";
            const url = "http://127.0.0.1:8899/gather-manage/tools";
            const page = await engine.init(url);
            if(!page){ 
                return;
            }
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
                this.saveSku(resourceId, gatherBatchId, context, monitor.getType());
            }
            return result;
        } catch(error){
            log.error("login error", error);
        }
    }

    saveSku(resourceId : number, gatherBatchId : number , context : BrowserContext|undefined, type : string){
        if(!context || monitorConfig[resourceId]){
            return;
        }
        log.info("context on page ");
        const monitorKey = "PxxSkuMonitor";
        context.on("response", async response => {
            const request = response.request();
            const requestUrl = request.url();
            if(requestUrl.includes("goods_id=")){
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
                    this.saveGatherSku(gatherBatchId, goodsId, rawData);  // 保存采集商品
                } else {
                    log.info("row data not found");
                }
            }
        });
        monitorConfig[resourceId] = true;
    }

    async saveByJson(rawData : string, url : string, doorKey : string, itemKey : string, type : string){
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
            await saveDoorRecord(doorRecord);
            log.info("save door record success ", itemKey);
        } catch(error){
            log.error("save by json error ", error);
        }
    }


    async saveGatherSku(gatherBatchId : number, itemKey : string, rawData : string){
        try{
            const jsonData = JSON.parse(rawData);
            const initDataObj = jsonData?.store?.initDataObj;
            if(!initDataObj){
                log.warn(`${itemKey} initDataObj not found`);
                return;
            }


            const doorSkuDTO = this.parseSku(initDataObj);
            if(!doorSkuDTO){
                log.warn(`${itemKey} doorSkuDTO not found`);
                return;
            }

            // 保存采集商品
            const gatherSkuCreateReq = new GatherSkuCreateReq(
                gatherBatchId,
                doorSkuDTO.title,
                PDD,
                doorSkuDTO.saleNum,
                doorSkuDTO.price,
                doorSkuDTO.itemId,
                false
            )

            log.info(doorSkuDTO)

            const gatherSku = await addGatherSku(gatherSkuCreateReq);
            log.info('gatherSku: ', gatherSku);
            this.send('onGatherSkuMessage', gatherSku, true);
        }finally{
            this.send('onGatherToolLoaded', false);
        }
         // 保存页面的静态HTML
         await this.saveCurrentPageHtml(itemKey);
    }

    private parseSku(initDataObj: any): any {
        const doorSkuDTO = {
            title: '',
            saleNum: '',
            price: '',
            itemId: '',
        }

        doorSkuDTO.title = initDataObj.goods?.goodsName;
        doorSkuDTO.saleNum = initDataObj.goods?.sideSalesTip;
        doorSkuDTO.price = initDataObj.goods?.ui?.new_price_section?.price;
        doorSkuDTO.itemId = initDataObj.goods?.goodsID;
        if (doorSkuDTO.itemId) {
            doorSkuDTO.itemId = String(doorSkuDTO.itemId)
        }

        return doorSkuDTO
    }

    private async saveCurrentPageHtml(itemKey: string): Promise<void> {
        try {
            // if (!this.currentPage) {
            //     log.warn(`Cannot save HTML: no current page available for item ${itemKey}`);
            //     return;
            // }
            
            // 方法1: 使用content()方法获取HTML
            const htmlCode = await this.getPxxHtml();
            const htmlContent = await getGatherWindow()?.webContents.executeJavaScript(htmlCode);
            if(!htmlContent){
                log.warn(`Cannot save HTML: no current page available for item ${itemKey}`);
                return;
            }
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
            // await this.captureScreenshot(itemKey);
            
            // log.info(`Successfully saved HTML for item ${itemKey} to ${filePath}`);
        } catch (error) {
            log.error(`Error saving HTML for item ${itemKey}:`, error);
        }
    }
    
    /**
     * 获取页面截图并保存
     */
    private async captureScreenshot(itemKey: string): Promise<void> {
        // try {
        //     if (!this.currentPage) {
        //         return;
        //     }
            
        //     const userDataPath = app.getPath('userData');
        //     const screenshotDir = path.join(userDataPath, 'resource', 'gather', 'screenshots');
        //     if(!fs.existsSync(screenshotDir)){
        //         fs.mkdirSync(screenshotDir, { recursive: true });
        //     }
            
        //     const screenshotPath = path.join(screenshotDir, `pdd_${itemKey}.png`);
        //     await this.currentPage.screenshot({ path: screenshotPath, fullPage: true });
        //     log.info(`Captured screenshot for item ${itemKey}`);
        // } catch (error) {
        //     log.error(`Error capturing screenshot for item ${itemKey}:`, error);
        // }
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

  @InvokeType(Protocols.INVOKE)
  async openGatherTool(resourceId: number, gatherBatchId : number): Promise<boolean> {
    await this.createGatherWindow(resourceId, gatherBatchId);
    return true
  }

   /**
     * 打开本地HTML文件
     */
   @InvokeType(Protocols.INVOKE)
   async openLocalHtmlFile(id: number, source: string, itemKey: string): Promise<boolean> {
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
                // this.createDetailWindow(filePath);
                try{
                    this.send('onGatherToolLoaded', true);
                    await getGatherWindow().webContents.loadFile(filePath);
                    const gatherSku = await getGatherSkuByID(id);
                    this.send('onGatherSkuMessage', gatherSku, false);
                    return true;
                }finally{
                    this.send('onGatherToolLoaded', false);
                }
           }
           return false;
       } catch (error) {
           log.error('Error opening local HTML file:', error);
           return false;
       }
   }

  @InvokeType(Protocols.INVOKE)
  async openSkuInfoPage(id: number, skuId: string): Promise<boolean> {
    // 调用后端API查询本地HTML文件是否存在
    try {
        // 这里假设后端有一个checkLocalHtmlExists方法，如果没有的话需要在后端添加
        const localFileExists = await this.checkLocalHtmlExists(PDD, skuId)
        
        if (localFileExists) {
          // 如果本地文件存在，打开本地文件
          // 由于需要通过后端打开文件，可能需要新增一个openLocalFile方法
          return await this.openLocalHtmlFile(id, PDD, skuId)
        } 
        return false;
      } catch (error) {
        console.error('Error checking local HTML file:', error)
        // 出错时回退到使用在线链接
        // window.open(`${PDD_URL}${skuId}`, '_blank')
        return false;
      }
  }
}
