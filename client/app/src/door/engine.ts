import path from 'path';
import fs from 'fs'
import { Browser, chromium, devices,firefox, BrowserContext, Page, Route ,Request, Response} from 'playwright';
import { get, set } from '@utils/store/electron';
import { app } from 'electron';
import { Monitor, MonitorChain, MonitorRequest, MonitorResponse } from './monitor/monitor';
import { DoorEntity } from './entity';
import log from 'electron-log';
import { getDoorList, getDoorRecord, saveDoorRecord } from '@api/door/door.api';
import { DoorRecord } from '@model/door/door';
const browserMap = new Map<string, Browser>();

const contextMap = new Map<string, BrowserContext>();

export abstract class DoorEngine<T = any> {

    private chromePath: string | undefined;

    browser: Browser | undefined;

    context: BrowserContext | undefined;

    public resourceId : number;

    public headless: boolean = true;

    monitors : Monitor<T>[] = [];

    monitorsChain : MonitorChain<T>[] = [];

    page : Page | undefined;

    constructor(resourceId : number, headless: boolean = true, chromePath: string = "", forceSaveSesssion = false){
        this.resourceId = resourceId;
        if(chromePath){
            this.chromePath = chromePath;
        }else{
            this.chromePath = this.getChromePath();
        }
        this.headless = headless;
    }

    getChromePath() : string | undefined{
        return process.env.CHROME_PATH;
    }

    addMonitor(monitor: Monitor){
        this.monitors.push(monitor);
    }

    addMonitorChain(monitorChain: MonitorChain<T>){
        this.monitorsChain.push(monitorChain);
        this.monitors.push(...monitorChain.getMonitors());
    }

    public async init(url : string|undefined = undefined) : Promise<Page | undefined> {
        this.browser = await this.createBrowser();
        if(!this.context){
            this.context = await this.createContext();
        }
        // this.context = await this.createBrowser();
        if(!this.context){
            return undefined;
        }
        const page = await this.context.newPage();
        if(url){
            await page.goto(url);
        }
        this.onRequest(page);
        this.onResponse(page);
        this.page = page;
        return page;
    }

    public async closePage(){
        if(this.page){
            await this.page.close();
        }
    }

    public async release(){
        // const browserKey = this.getBrowserKey();
        // if(browserMap.has(browserKey)){
        //     const browser = browserMap.get(browserKey);
        //     if(browser){
        //         await browser.close();
        //     }
        //     browserMap.delete(browserKey);
        // }
    }


    public async doBeforeRequest(router : Route, request: Request, headers: { [key: string]: string; }){
        let isFilter = false;
        for(const monitor of this.monitors){
            if(await monitor.filter(request.url(), request.resourceType(), request.method(), headers)){
                await router.abort();
                isFilter = true;
                continue;
            }
            if(monitor.finishTag){
                continue;
            }
            
            if(!(monitor instanceof MonitorRequest)){
                continue;
            }
            if(!await monitor.isMatch(request.url(), request.method(), headers)){
                continue;
            }
            const requestMonitor = monitor as MonitorRequest<T>;
            let data;
            if(requestMonitor.handler){
                data = await requestMonitor.handler(request, undefined);
            }
            let headerData = {};
            if(requestMonitor.needHeaderData()){
                headerData = await request.allHeaders();
            }
            let url = "";
            if(requestMonitor.needUrl()){
                url = request.url();
            }
            let requestBody = {};
            if(requestMonitor.needRequestBody()){
                const body = request.postData();
                if(body){
                    const params = new URLSearchParams(body);
                    // 将其转换为对象
                    requestBody = Object.fromEntries(params.entries());
                }
            }
            monitor._doCallback(new DoorEntity(data ? true : false, data, url, headerData, requestBody));
            monitor.setFinishTag(true);
        }
        return isFilter;
    }

    public async onRequest(page : Page){
        page.route("*/**", async (router : Route) => {
            // 获取请求对象
            const request = router.request();
            const headers = await request.allHeaders();
            const isFilter = await this.doBeforeRequest(router, request, headers);
            if(isFilter){
                return;
            }
            router.continue();
        });
    }

    public async doAfterResponse(response: Response){
        for(const monitor of this.monitors){
            if(monitor.finishTag){
                continue;
            }
            if(!(monitor instanceof MonitorResponse)){
                continue;
            }
            const responseMonitor = monitor as MonitorResponse<T>;
            if(!await monitor.doMatchResponse(response)){
                continue;
            }
            let headerData = {};
            const request = response.request();
            if(responseMonitor.needHeaderData()){
                headerData = await request.allHeaders();
            }
            let url = "";
            if(responseMonitor.needUrl()){
                url = request.url();
            }
            let requestBody = {};
            if(responseMonitor.needRequestBody()){
                const body = request.postData();
                if(body){
                    const params = new URLSearchParams(body);
                    // 将其转换为对象
                    requestBody = Object.fromEntries(params.entries());
                }
            }
            const data = await responseMonitor.getResponseData(response);
            const doorEntity = new DoorEntity<T>(data ? true : false, data, url, headerData, requestBody);
            responseMonitor._doCallback(doorEntity, response.request(), response);
            responseMonitor.setFinishTag(true);
        }
    }

    public async onResponse(page : Page){
        page.on('response', async (response) => {
            await this.doAfterResponse(response);
        });
    }

    public async openWaitMonitor(page : Page,  url: string, monitor : Monitor<T | any>, headers: Record<string, string> = {}, doAction: (page: Page, ...doActionParams: any[]) => Promise<void> = async (page: Page, ...doActionParams: any[]) => {}, ...doActionParams: any[]){
        const itemKey = monitor.getItemKeys(url);
        const cache = await this.fromCacheByMonitor(url, itemKey, monitor);
        if(cache){
            return cache;
        }
        this.addMonitor(monitor);
        await this.startMonitor();
        await page.goto(url, headers);
        await doAction(page, ...doActionParams);
        const doorEntity = await monitor.waitForAction();
        if(monitor instanceof MonitorResponse && itemKey){
            await this.saveCache(url, monitor.getKey(), monitor.getType(), itemKey, doorEntity);
        }
        return doorEntity;
    }

    public async openNotWaitMonitor(page : Page,  url: string, monitor : Monitor<T | any>, headers: Record<string, string> = {}, doAction: (page: Page, ...doActionParams: any[]) => Promise<any>, ...doActionParams: any[]){
        const itemKey = monitor.getItemKeys(url);
        const cache = await this.fromCacheByMonitor(url, itemKey, monitor);
        if(cache){
            return cache;
        }
        this.addMonitor(monitor);
        await this.startMonitor();
        await page.goto(url, headers);
        const result = await doAction(page, ...doActionParams);
        return result;
    }

    public async saveCache(url : string, monitorKey : string, type : string, itemKey : string, doorEntity: DoorEntity<T>){
        if(!doorEntity.code){
            return;
        }
        const doorRecord = new DoorRecord(undefined, monitorKey, url, itemKey, type, JSON.stringify(doorEntity.data));
        await saveDoorRecord(doorRecord);
    }

    public async fromCacheByMonitor(url : string, itemKey : string | undefined, monitor : Monitor<T>) : Promise<DoorEntity<T> | undefined> {
        if(!(monitor instanceof MonitorResponse)){
            return undefined;
        }
        if(itemKey == undefined){
            return undefined;
        }
        const monitorKey = monitor.getKey();
        const type = monitor.getType();
        const doorRecord = await getDoorRecord(monitorKey, itemKey, type);
        if(doorRecord){
            return new DoorEntity(true, JSON.parse(doorRecord.data));
        }
        return undefined;
    }

    public async fromCacheByMonitorChain(url : string, itemKey : string | undefined, monitorChain : MonitorChain<T>) : Promise<DoorEntity<T> | undefined> {
        if(itemKey == undefined){
            return undefined;
        }
        const monitorKey = monitorChain.getKey();
        const type = monitorChain.getType();
        const doorRecord = await getDoorRecord(monitorKey, itemKey, type);
        if(doorRecord){
            return new DoorEntity(true, JSON.parse(doorRecord.data));
        }
        return undefined;
    }

    public async openWaitMonitorChain(page : Page,  url: string, monitorChain: MonitorChain<T | any>, headers: Record<string, string> = {}, doAction: (page: Page, ...doActionParams: any[]) => Promise<void> = async (page: Page, ...doActionParams: any[]) => {}, ...doActionParams: any[] ){
        const itemKey = monitorChain.getItemKeys(url);
        const cache = await this.fromCacheByMonitorChain(url, itemKey, monitorChain)
        if(cache){
            return cache;
        }
        this.addMonitorChain(monitorChain);
        await this.startMonitor();
        await page.goto(url, headers);
        await doAction(page, ...doActionParams);
        const doorEntity = await monitorChain.waitForAction();
        if(doorEntity && doorEntity.code && itemKey){
            await this.saveCache(url, monitorChain.getKey(), monitorChain.getType(), itemKey, doorEntity);
        }
        return doorEntity;
    }

    public async startMonitor(){
        for(const monitor of this.monitors){
            monitor.start();
        }
    }

    public async doFillWaitForElement(page : Page, version: string, doorType: string, data? : any) {
        const actionCommands = await getDoorList(version, doorType);
        let prevResult : DoorEntity<T> | undefined = undefined;
        for (const actionCommand of actionCommands) {
            const monitorChain = this.getMonitorChainFromChain(actionCommand.key);
            if(monitorChain){
                await monitorChain.start();
            }else{
                const monitor = this.getMonitor(actionCommand.key);
                if(monitor){
                    await monitor.start();
                }
            }
            const dynamicFunction = new Function(actionCommand.code)();
            await dynamicFunction(page, prevResult, data);
            prevResult = await monitorChain?.waitForAction();
            if(!prevResult){
                continue;
            }
            if(!prevResult.code){
                return prevResult;
            }
        }
        return prevResult;
    }

    getMonitorChainFromChain(key : string) : MonitorChain<T> | undefined{
        if(!this.monitorsChain || this.monitorsChain.length == 0){
            return undefined;
        }
        for(const monitorChain of this.monitorsChain){
            if(monitorChain.getKey() == key){
                return monitorChain;
            }
        }
        return undefined;
    }

    getMonitor(key : string) : Monitor<T> | undefined{
        if(!this.monitors || this.monitors.length == 0){
            return undefined;
        }
        for(const monitor of this.monitors){
            if(monitor.getKey() == key){
                return monitor;
            }
        }
        return undefined;
    }

    public async closeContext(){
        if(this.context){
            await this.context.close();
        }
    }

    public async closeBrowser(){
        if(this.browser){
            await this.browser.close();
        }
    }

    getKey(){
        return `door_engine_${this.getNamespace()}_${this.resourceId}`;
    }

    async getSessionPath(){
        let sessionPath = get(this.getKey())
        if(fs.existsSync(sessionPath)){
            return sessionPath;
        }
        return undefined;
    }

    getSessionDir(){
        const sessionFileName = Date.now().toString() + ".json";
        const name = this.constructor.name;
        const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource','session',this.getNamespace(), this.resourceId.toString());
        if(!fs.existsSync(sessionDirPath)){
            fs.mkdirSync(sessionDirPath, { recursive: true });
        }
        const sessionDir = path.join(sessionDirPath, sessionFileName);
        return sessionDir;
    }

    getUserDataDir(){
        const name = this.constructor.name;
        const userDataDir = path.join(path.dirname(app.getAppPath()),'resource','userDataDir',this.getNamespace(), this.resourceId.toString());
        if(!fs.existsSync(userDataDir)){
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        return userDataDir;
    }

    abstract getNamespace(): string;

    public async saveContextState() {
        if(!this.context){
            return;
        }
        const sessionDir = this.getSessionDir();
        set(this.getKey(), sessionDir);
        await this.context.storageState({ path: sessionDir});
    }

    public getHeaderKey(){
        return `${this.resourceId}_door_header_${this.getKey()}`;
    }

    public setHeader(header : {[key : string] : any}){
        const key = this.getHeaderKey();
        set(key, header);
    }

    public getHeader(){
        const key = this.getHeaderKey();
        return get(key);
    }

    async createContext(){
        if(!this.browser){
            return;
        }
        const key = this.headless.toString() + "_" + this.getKey();
        if(contextMap.has(key)){
            return contextMap.get(key);
        }
        // let context;
        const storeBrowserPath = await this.getRealChromePath();
        const platform = await getPlatform();
        const contextConfig : any = {
            bypassCSP : true,
            locale: 'zh-CN'
        }
        if(storeBrowserPath){
            contextConfig.executablePath = storeBrowserPath;
        }
        if(platform){
            contextConfig.userAgent = platform.userAgent;
            contextConfig.extraHTTPHeaders = {
                'sec-ch-ua': getSecChUa(platform),
                'sec-ch-ua-mobile': '?0', // 设置为移动设备
                'sec-ch-ua-platform': `"${platform.userAgentData.platform}"`,
            };
        }
        const sessionPath = await this.getSessionPath();
        if(sessionPath){
            contextConfig.storageState = sessionPath;
        }
        const context = await this.browser?.newContext(contextConfig);
        contextMap.set(key, context);
        return context;
    }

    async getRealChromePath(){
        // if(this.chromePath && this.chromePath != ""){
        //     return this.chromePath;
        // }
        // return get("browserPath");
        const platform = process.platform;
        // 判断是否是打包环境
        if(platform != "darwin"){
            const isPackaged = app.isPackaged;
            if (isPackaged) {
                // 打包后的路径 (在 resources/app.asar 或 resources/app 目录下)
                const chromeBinPath = path.join(path.dirname(app.getAppPath()),'Chrome-bin','chrome.exe');
                if(fs.existsSync(chromeBinPath)){
                    return chromeBinPath;
                }
                // 如果不在 asar 中，则使用：
                // return path.join(process.resourcesPath, 'app', 'Chrome-bin');
            }
        }
        return undefined;
    }

    getBrowserKey(){
        let key = this.headless.toString();
        if (this.chromePath) {
            key += "_" + this.chromePath;
        }
        return key;
    }

    async createBrowser(){
        let key = this.getBrowserKey();
        log.info("browser key is ", key);
        let storeBrowserPath = await this.getRealChromePath();
        if(browserMap.has(key)){
            return browserMap.get(key);
        }
        // if(contextMap.has(key)){
        //     return contextMap.get(key);
        // }
        // const userDataDir = this.getUserDataDir();
        // const platform = await getPlatform();
        // const context = await chromium.launchPersistentContext(userDataDir,{
        //     headless: this.headless,
        //     executablePath: storeBrowserPath,
        //     args: [
        //         '--disable-accelerated-2d-canvas', '--disable-webgl', '--disable-software-rasterizer',
        //         '--no-sandbox', // 取消沙箱，某些网站可能会检测到沙箱模式
        //         '--disable-setuid-sandbox',
        //         '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
        //     ],
        //     extraHTTPHeaders: {
        //         'sec-ch-ua': getSecChUa(platform),
        //         'sec-ch-ua-mobile': '?0', // 设置为移动设备
        //         'sec-ch-ua-platform': `"${platform.userAgentData.platform}"`,
        //     },
        //     userAgent: platform.userAgent,
        //     bypassCSP : true,
        //     locale: 'zh-CN',
        // })
        // contextMap.set(key, context);
        // return context;

        const browser = await chromium.launch({
            headless: this.headless,
            executablePath: storeBrowserPath,
            args: [
                '--disable-accelerated-2d-canvas', '--disable-webgl', '--disable-software-rasterizer',
                '--no-sandbox', // 取消沙箱，某些网站可能会检测到沙箱模式
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
              ]
        });
        browserMap.set(key, browser);
        return browser;
    }

}

function getSecChUa(platform : any){
    const brands = platform.userAgentData.brands;
    const result = [];
    for(const brand of brands){
        result.push(`"${brand.brand}";v="${brand.version}"`);
    }
    return result.join(", ");
}

export async function initPlatform(){
    let browser : Browser | undefined = undefined;
    try{
        let platform = await getPlatform();
        if(platform){
            return platform;
        }
        browser = await chromium.launch({
            headless: false,
            args: [
            '--disable-accelerated-2d-canvas', '--disable-webgl', '--disable-software-rasterizer',
            '--no-sandbox', // 取消沙箱，某些网站可能会检测到沙箱模式
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
          ]
         });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto("https://www.baidu.com");
        platform = await setPlatform(page);
        log.info("login platform is ", JSON.stringify(platform));
        return platform;
    }catch(error){
        log.error("initPlatform error", error);
    }finally{
        if(browser){
            await browser.close();
        }
    }
}

export async function setPlatform(page : Page){
    const platform = await page.evaluate(() => {
        // @ts-ignore
        const navigatorObj = navigator;
        const result : any = {};
        for(let key in navigatorObj){
            result[key] = navigatorObj[key];
        }
        return result;
    });
    set("browserPlatform", JSON.stringify(platform));
    return platform;
}

export async function getPlatform(){
    const browserPlatform = await get("browserPlatform");
    if(browserPlatform){
        return JSON.parse(browserPlatform);
    }
    return undefined;
}