import path from 'path';
import fs from 'fs'
import { Browser, chromium, devices,firefox, BrowserContext, Page, Route ,Request, Response} from 'playwright';
import { get, set } from '@src/store/local';
import { app } from 'electron';
import { Monitor, MonitorRequest, MonitorResponse } from './monitor/monitor';
import { DoorEntity } from './entity';


const browserMap = new Map<string, Browser>();

const contextMap = new Map<string, BrowserContext>();

export abstract class DoorEngine {

    private chromePath: string;

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

    abstract getChromePath() : string;

    public addMonitor(monitor: Monitor){
        this.monitors.push(monitor);
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
            const responseMonitor = monitor as MonitorResponse;
            if(!await monitor.doMatchResponse(response)){
                continue;
            }
            const data = await responseMonitor.getResponseData(response);
            responseMonitor._doCallback(new DoorEntity(data ? true : false, data));
            responseMonitor.setFinishTag(true);
        }
    }

    public async onResponse(page : Page){
        page.on('response', async (response) => {
            await this.doAfterResponse(response);
        });
    }

    public async open(page : Page,  url: string, headers: Record<string, string> = {}){
        await page.goto(url, headers);
    }


    public async startMonitor(){
        for(const monitor of this.monitors){
            await monitor.start();
        }
    }

    public async asyncDoElement(windowId: string, page : Page) : Promise<void>{
        return new Promise((resolve, reject) => {
            this.doWaitForElement(windowId, page).then(resolve).catch(reject);
        });
    }

    public async doWaitForElement(windowId: string, page : Page) {
        const data = await this.doWaitFor(windowId, page);
        let doorEntity = new DoorEntity();
        if(data){ 
            doorEntity.data = data;
            doorEntity.code = true;
        }else{
            doorEntity.code = false;
        }
        await this.doCallback(doorEntity);
    }

    abstract doWaitFor(windowId: string, page : Page) : Promise<{}|undefined>;

    abstract doCallback(doorEntity: DoorEntity) : Promise<void>;


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
        // 保存 cookies 和 localStorage 状态
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
        const key = this.getKey();
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
            executablePath: this.chromePath ? this.chromePath : undefined,
            args: [
                '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
              ]
        });
        browserMap.set(key, browser);
        return browser;
    }

}
