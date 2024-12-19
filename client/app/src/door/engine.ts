import path from 'path';
import fs from 'fs'
import { Browser, chromium, devices,firefox, BrowserContext, Page, Route ,Request, Response} from 'playwright';
import { get, set } from '@utils/store/electron';
import { app } from 'electron';
import { Monitor, MonitorChain, MonitorRequest, MonitorResponse } from './monitor/monitor';
import { DoorEntity } from './entity';
import log from 'electron-log';
import { ActionChain } from './element/element';
import { getDoorList, getDoorRecord, saveDoorRecord } from '@api/door/door.api';
import { DoorRecord } from '@model/door/door';

const browserMap = new Map<string, Browser>();

const contextMap = new Map<string, BrowserContext>();

export abstract class DoorEngine {

    private chromePath: string | undefined;

    browser: Browser | undefined;

    context: BrowserContext | undefined;

    public resourceId : number;

    public headless: boolean = true;

    monitors : Monitor[] = [];

    page : Page | undefined;

    constructor(resourceId : number, headless: boolean = true, chromePath: string = ""){
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

    addMonitorChain(monitorChain: MonitorChain){
        this.monitors.push(...monitorChain.getMonitors());
    }

    public async init() : Promise<Page | undefined> {
        if(this.browser){
            return undefined;
        }
        this.browser = await this.createBrowser();
        if(!this.context){
            this.context = await this.createContext();
        }
        if(!this.context){
            return undefined;
        }
        const page = await this.context.newPage();
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


    public async doBeforeRequest(request: Request, headers: { [key: string]: string; }){
        for(const monitor of this.monitors){
            if(monitor.finishTag){
                continue;
            }
            if(!(monitor instanceof MonitorRequest)){
                continue;
            }
            if(!await monitor.isMatch(request.url(), request.method(), headers)){
                continue;
            }
            const requestMonitor = monitor as MonitorRequest;
            let data;
            if(requestMonitor.handler){
                data = await requestMonitor.handler(request, undefined);
            }
            monitor._doCallback(new DoorEntity(data ? true : false, data));
            monitor.setFinishTag(true);
        }
    }

    public async onRequest(page : Page){
        page.route("*/**", async (router : Route) => {
            // 获取请求对象
            const request = router.request();
            const headers = await request.allHeaders();
            await this.doBeforeRequest(request, headers);
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
            const responseMonitor = monitor as MonitorResponse;
            if(!await monitor.doMatchResponse(response)){
                continue;
            }
            const data = await responseMonitor.getResponseData(response);
            const doorEntity = new DoorEntity(data ? true : false, data);
            responseMonitor._doCallback(doorEntity, response.request(), response);
            responseMonitor.setFinishTag(true);
        }
    }

    public async onResponse(page : Page){
        page.on('response', async (response) => {
            await this.doAfterResponse(response);
        });
    }

    public async openWaitMonitor(page : Page,  url: string, monitor : Monitor, headers: Record<string, string> = {}){
        const itemKey = monitor.getItemKeys(url);
        const cache = await this.fromCacheByMonitor(url, itemKey, monitor);
        if(cache){
            return cache;
        }
        this.addMonitor(monitor);
        await this.startMonitor();
        await page.goto(url, headers);
        const doorEntity = await monitor.waitForAction();
        if(monitor instanceof MonitorResponse && itemKey){
            await this.saveCache(url, monitor.getKey(), monitor.getType(), itemKey, doorEntity);
        }
        return doorEntity;
    }

    public async saveCache(url : string, monitorKey : string, type : string, itemKey : string, doorEntity: DoorEntity){
        if(!doorEntity.code){
            return;
        }
        const doorRecord = new DoorRecord(undefined, monitorKey, url, itemKey, type, JSON.stringify(doorEntity.data));
        await saveDoorRecord(doorRecord);
    }

    public async fromCacheByMonitor(url : string, itemKey : string | undefined, monitor : Monitor) : Promise<DoorEntity | undefined> {
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

    public async fromCacheByMonitorChain(url : string, itemKey : string | undefined, monitorChain : MonitorChain) : Promise<DoorEntity | undefined> {
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

    public async openWaitMonitorChain(page : Page,  url: string, monitorChain: MonitorChain, headers: Record<string, string> = {}){
        const itemKey = monitorChain.getItemKeys(url);
        const cache = await this.fromCacheByMonitorChain(url, itemKey, monitorChain)
        if(cache){
            return cache;
        }
        this.addMonitorChain(monitorChain);
        await this.startMonitor();
        await page.goto(url, headers);
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

    public async doWaitForElement(page : Page, version: string, doorType: string) {
        const actionCommands = await getDoorList(version, doorType);
        const actionChain = new ActionChain();
        actionChain.addActionCommands(actionCommands);
        const result = await actionChain.do(page);
        return result;
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
        return sessionPath;
    }

    getSessionDir(){
        const sessionFileName = Date.now().toString() + ".json";
        const name = this.constructor.name;
        return path.join(path.dirname(app.getAppPath()),'resource','session',this.getNamespace(), this.resourceId.toString(), sessionFileName);
    }

    abstract getNamespace(): string;

    public async saveContextState() {
        if(!this.context){
            return;
        }
        const sessionDir = this.getSessionDir();
        set(this.getKey(), sessionDir);
        console.log("saveContextState ", sessionDir);
        await this.context.storageState({ path: sessionDir});
      }

    async createContext(){
        if(!this.browser){
            return;
        }
        const key = this.headless.toString() + "_" + this.getKey();
        if(contextMap.has(key)){
            return contextMap.get(key);
        }
        const sessionPath = await this.getSessionPath();
        let context;
        if (fs.existsSync(sessionPath)) {
            context = await this.browser?.newContext({
                storageState: sessionPath, // 加载上次保存的状态
                bypassCSP: true,
            });
        } else {
            context = await this.browser?.newContext({
                bypassCSP: true
            }); // 创建一个新的上下文
        }
        contextMap.set(key, context);
        return context;
    }

    async createBrowser(){
        let key = this.headless.toString();
        if (this.chromePath) {
            key += "_" + this.chromePath;
        }
        if(browserMap.has(key)){
            return browserMap.get(key);
        }
        const browser = await chromium.launch({
            headless: this.headless,
            executablePath: this.chromePath,
            args: [
                '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
              ]
        });
        browserMap.set(key, browser);
        return browser;
    }

}

