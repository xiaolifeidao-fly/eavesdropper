import path from 'path';
import fs from 'fs'
import { Browser, chromium, devices,firefox, BrowserContext, Page, Route ,Request, Response} from 'playwright';
import { get, set } from '@utils/store/electron';
import { app, screen as electronScreen } from 'electron';
import { Monitor, MonitorChain, MonitorRequest, MonitorResponse } from './monitor/monitor';
import { DoorEntity } from './entity';
import log from 'electron-log';
import { getDoorList, getDoorRecord, saveDoorRecord } from '@api/door/door.api';
import { DoorRecord } from '@model/door/door';
declare const window: any;
declare const navigator: any;
declare const document: any;
declare const screen: any;
declare const WebGLRenderingContext: any;
declare const HTMLCanvasElement: any;
declare const Element: any;
declare const WebGL2RenderingContext: any;
declare const MimeType: any;
declare const performance: any;
const browserMap = new Map<string, Browser>();

const contextMap = new Map<string, BrowserContext>();

export abstract class DoorEngine<T = any> {

    protected chromePath: string | undefined;

    protected browser: Browser | undefined;

    protected context: BrowserContext | undefined;

    public resourceId : number;

    public headless: boolean = true;

    monitors : Monitor<T>[] = [];

    monitorsChain : MonitorChain<T>[] = [];

    page : Page | undefined;

    width : number;
    height : number;
    usePersistentContext : boolean;

    needValidateImage : boolean = false;

    browserArgs : string[] = [
        '--disable-accelerated-2d-canvas', '--disable-webgl', '--disable-software-rasterizer',
        '--no-sandbox', // 取消沙箱，某些网站可能会检测到沙箱模式
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
      ];

    constructor(resourceId : number, headless: boolean = true, chromePath: string = "", usePersistentContext : boolean = false, browserArgs : string[]|undefined = undefined){
        this.resourceId = resourceId;
        this.usePersistentContext = usePersistentContext;
        if(chromePath){
            this.chromePath = chromePath;
        }else{
            this.chromePath = this.getChromePath();
        }
        this.headless = headless;
        if(browserArgs){
            this.browserArgs = browserArgs;
        }
        try{
            const primaryDisplay = electronScreen.getPrimaryDisplay();
            this.width = primaryDisplay.workAreaSize.width;
            this.height = primaryDisplay.workAreaSize.height;
        }catch(error){
            this.width = 1920;
            this.height = 1080;
            log.error("init width and height error", error);
        }
    }

    setNeedValidateImage(needValidateImage : boolean){
        this.needValidateImage = needValidateImage;
    }

    getChromePath() : string | undefined{
        return process.env.CHROME_PATH;
    }

    addMonitor(monitor: Monitor){
        this.monitors.push(monitor);
    }

    getPage(){
        return this.page;
    }

    addMonitorChain(monitorChain: MonitorChain<T>){
        this.monitorsChain.push(monitorChain);
        this.monitors.push(...monitorChain.getMonitors());
    }



    public async init(url : string|undefined = undefined) : Promise<Page | undefined> {
        // if(this.usePersistentContext){
        //     return this.initByPersistentContext(url);
        // }
        this.browser = await this.createBrowser();
        if(!this.context){
            this.context = await this.createContext();
        }
        // this.context = await this.createBrowser();
        if(!this.context){
            log.info("context is null");
            return undefined;
        }
        
        // 添加网络请求拦截
        // await this.setupNetworkInterception(this.context);
        
        const page = await this.context.newPage();
        await page.setViewportSize({ width: this.width, height: this.height });
        if(url){
            await page.goto(url);
        }
        this.onRequest(page);
        this.onResponse(page);
        this.page = page;
        return page;
    }



    async initByPersistentContext(url : string|undefined = undefined) : Promise<Page | undefined> {
        this.context = await this.createContextByPersistentContext();
        if(!this.context){
            return undefined;
        }
        const page = await this.context.newPage();
        await page.setViewportSize({ width: this.width, height: this.height });
        if(url){
            await page.goto(url);
        }
        this.onRequest(page);
        this.onResponse(page);
        this.page = page;
        return page;
    }

    async createContextByPersistentContext(): Promise<BrowserContext> {
        let storeBrowserPath = await this.getRealChromePath();

        let key = this.getKey();
        if(storeBrowserPath){
            key += "_" + storeBrowserPath;
        }   
        log.info("browser key is ", key);
        if(contextMap.has(key)){
            return contextMap.get(key) as BrowserContext;
        }
        const userDataDir = this.getUserDataDir();
        log.info("userDataDir is ", userDataDir);
        const platform = await getPlatform();
        const context = await chromium.launchPersistentContext(userDataDir,{
            headless: this.headless,
            executablePath: storeBrowserPath,
            args: [
                '--disable-accelerated-2d-canvas', '--disable-webgl', '--disable-software-rasterizer',
                '--no-sandbox', // 取消沙箱，某些网站可能会检测到沙箱模式
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',  // 禁用浏览器自动化控制特性
                '--window-size=' + this.width + ',' + this.height
            ],
            extraHTTPHeaders: {
                'sec-ch-ua': getSecChUa(platform),
                'sec-ch-ua-mobile': '?0', // 设置为移动设备
                'sec-ch-ua-platform': `"${platform.userAgentData.platform}"`,
            },
            userAgent: platform.userAgent,
            bypassCSP : true,
            locale: 'zh-CN',
        })
        contextMap.set(key, context);
        return context;
    }

    public getContext(){
        return this.context;
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
            
            const allHeaders = await request.allHeaders();
            if(responseMonitor.needHeaderData()){
                headerData = allHeaders;
            }
            let url = "";
            if(responseMonitor.needUrl()){
                url = request.url();
            }
            let responseHeaderData = {};
            if(responseMonitor.needResponseHeaderData()){
                responseHeaderData = await response.allHeaders();
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
            data.url = url;
            data.headerData = headerData;
            data.requestBody = requestBody;
            data.responseHeaderData = responseHeaderData;
            if(data && data.code){
                if(headerData && Object.keys(headerData).length > 0){
                    const key = this.getKey();
                    const isNeedStoreContext = responseMonitor.needStoreContext(key, headerData);
                    if(isNeedStoreContext){
                        this.setHeader(headerData);
                        responseMonitor.setStoreContext(key);
                        log.info("session reset save context state");
                        await this.saveContextState();
                    }
                }
            }
            responseMonitor._doCallback(data, response.request(), response);
            responseMonitor.setFinishTag(true);
        }
    }

    public async onResponse(page : Page){
        page.on('response', async (response) => {
            await this.doAfterResponse(response);
        });
    }

    resetMonitor(){
        this.monitors = [];
        this.monitorsChain = [];
    }

    resetListener(page : Page){
        this.onRequest(page);
        this.onResponse(page);
    }

    public async openWaitMonitor(page : Page,  url: string | undefined, monitor : Monitor<T | any>, headers: Record<string, string> = {}, doAction: (page: Page, ...doActionParams: any[]) => Promise<void | DoorEntity<any> | undefined> = async (page: Page, ...doActionParams: any[]) => {return undefined}, ...doActionParams: any[]){
        const itemKey = monitor.getItemKeys(url);
        const cache = await this.fromCacheByMonitor(url, itemKey, monitor);
        if(cache){
            return cache;
        }
        this.addMonitor(monitor);
        await this.startMonitor();
        if(url){
            await page.goto(url);
        }
        const result = await doAction(page, ...doActionParams);
        if(result != undefined){
            if(result instanceof DoorEntity){
                return result;
            }
            return result;
        }
        const doorEntity = await monitor.waitForAction();
        if(monitor instanceof MonitorResponse && itemKey){
            if(url){
                await this.saveCache(url, monitor.getKey(), monitor.getType(), itemKey, doorEntity);
            }
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
        await page.goto(url);
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

    public async fromCacheByMonitor(url : string | undefined, itemKey : string | undefined, monitor : Monitor<T>) : Promise<DoorEntity<T> | undefined> {
        if(!url){
            return undefined;
        }   
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
        await page.goto(url);
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

    public getSessionDir(){
        const sessionFileName = Date.now().toString() + ".json";
        const name = this.constructor.name;
        const userDataPath = app.getPath('userData');

        const sessionDirPath = path.join(userDataPath,'resource','session',this.getNamespace(), this.resourceId.toString());
        log.info("sessionDirPath is ", sessionDirPath);
        if(!fs.existsSync(sessionDirPath)){
            fs.mkdirSync(sessionDirPath, { recursive: true });
        }
        const sessionDir = path.join(sessionDirPath, sessionFileName);
        return sessionDir;
    }

    getUserDataDir(){
        const userDataPath = app.getPath('userData');
        const userDataDir = path.join(userDataPath,'resource','userDataDir',this.getNamespace(), this.resourceId.toString());
        log.info("userDataDir is ", userDataDir);
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
        if(!header || Object.keys(header).length == 0){
            return;
        }
        const key = this.getHeaderKey();
        set(key, header);
    }

    public getHeader(){
        const key = this.getHeaderKey();
        return get(key);
    }

    public setParams(key : string, value : any){
        const paramsKey = this.getKey() + "_" + key;
        set(paramsKey, value);
    }

    public getParams(key : string){
        const paramsKey = this.getKey() + "_" + key;
        return get(paramsKey);
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
        contextConfig.screen = {
            width: this.width,
            height: this.height
        }
        const sessionPath = await this.getSessionPath();
        if(sessionPath){
            contextConfig.storageState = sessionPath;
        }
        if(platform){
            contextConfig.userAgent = platform.userAgent;
            contextConfig.extraHTTPHeaders = {
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
                'sec-ch-ua': getSecChUa(platform),
                'sec-ch-ua-mobile': '?0', // 设置为移动设备
                'sec-ch-ua-platform': `"${platform.userAgentData.platform}"`,
            };
        }
        const context = await this.browser?.newContext(contextConfig);
        
        // 添加反检测脚本
        if (context) {
            await this.addAntiDetectionScript(context);
        }
        
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
        return this.chromePath;
    }

    getBrowserKey(){
        let key = this.headless.toString() + "_" + this.needValidateImage.toString();
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
        
        // 随机化viewport尺寸，更真实
        const viewportWidth = this.width || (1280 + Math.floor(Math.random() * 200));
        const viewportHeight = this.height || (780 + Math.floor(Math.random() * 120));
        
        const args = [
            ...this.browserArgs,
            `--window-size=${viewportWidth},${viewportHeight}`,
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--start-maximized',
            '--disable-infobars',
            '--disable-notifications',
            '--disable-extensions',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--lang=zh-CN',
            '--disable-automation',
            '--disable-remote-fonts',
            '--disable-permissions-api',
            '--disable-device-orientation'
        ];
        
        if (this.headless) {
            args.push(
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote'
            );
        }
        
        const browser = await chromium.launch({
            headless: this.headless,
            slowMo: 15 + Math.floor(Math.random() * 30), // 修改为更小的随机延迟
            executablePath: storeBrowserPath,
            args: args
        });
        
        browserMap.set(key, browser);
        return browser;
    }

    // 添加网络请求拦截方法
    async setupNetworkInterception(context: BrowserContext) {
        await context.route('**/*', async route => {
            const request = route.request();
            const headers = await request.allHeaders();
            
            // 修改请求头，增加更多人类特征
            const customHeaders = {
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
                'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site'
            };
            
            // 合并头部信息
            const mergedHeaders = { ...headers, ...customHeaders };
            
            // 监听与验证相关的请求，记录详细日志
            if (request.url().includes('captcha') || 
                request.url().includes('verify') || 
                request.url().includes('check') || 
                request.url().includes('report') || 
                request.url().includes('punish') || 
                request.url().includes('_____tmd_____')) {
                log.info(`发现验证相关请求: ${request.url()}`);
                log.info(`请求方法: ${request.method()}`);
                
                try {
                    const postData = request.postData();
                    if (postData) {
                        log.info(`请求数据: ${postData}`);
                    }
                } catch (e) {
                    log.info(`无法获取请求数据: ${e}`);
                }
            }
            
            try {
                // 继续请求，但使用修改后的头部
                await route.continue({ headers: mergedHeaders });
            } catch (e) {
                // 如果修改失败，则以原始方式继续
                await route.continue();
            }
        });
    }

    // 添加新方法：注入反检测脚本
    async addAntiDetectionScript(context: BrowserContext) {
        await context.addInitScript(() => {
            // =================== 关键浏览器指纹伪装 ===================
            
            // 1. 覆盖navigator对象的关键属性
            const overrideNavigator = () => {
                // 覆盖webdriver属性
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false
                });
                
                // 语言伪装
                Object.defineProperty(navigator, 'languages', {
                    get: function() {
                        return ['zh-CN', 'zh', 'en-US', 'en'];
                    }
                });
                
                // 硬件并发伪装
                Object.defineProperty(navigator, 'hardwareConcurrency', {
                    get: function() {
                        return 8; // 大多数普通用户的值
                    }
                });
                
                // deviceMemory
                Object.defineProperty(navigator, 'deviceMemory', {
                    get: function() {
                        return 8; // 常见值
                    }
                });
                
                // 连接类型伪装
                // @ts-ignore
                if (navigator.connection) {
                    // @ts-ignore
                    Object.defineProperty(navigator.connection, 'rtt', {
                        get: function() {
                            return 50 + Math.floor(Math.random() * 40);
                        }
                    });
                }
                
                // 阻止权限查询
                const originalPermissions = navigator.permissions;
                if (originalPermissions) {
                    // 完全绕过TypeScript类型检查来修改权限API
                    Object.defineProperty(navigator.permissions, 'query', {
                        // @ts-ignore - 必须忽略类型检查以实现反检测
                        value: function() {
                            return Promise.resolve({
                                state: "prompt",
                                onchange: null
                            });
                        }
                    });
                }
            };
            
            // 2. 覆盖WebGL指纹
            const overrideWebGL = () => {
                try {
                    // 伪装WebGL
                    const getParameterProto = WebGLRenderingContext.prototype.getParameter;
                    // @ts-ignore
                    WebGLRenderingContext.prototype.getParameter = function(parameter) {
                        // 扰乱指纹值
                        if (parameter === 37445) {
                            return 'Intel Open Source Technology Center';
                        }
                        if (parameter === 37446) {
                            return 'Mesa DRI Intel(R) HD Graphics 630 (Kaby Lake GT2)';
                        }
                        return getParameterProto.apply(this, [...arguments]);
                    };
                } catch (e) {}
            };
            
            // 3. 覆盖Chrome特有属性
            const overrideChrome = () => {
                // @ts-ignore
                window.chrome = {
                    runtime: {},
                    loadTimes: function() {
                        return {
                            firstPaintTime: 0,
                            firstPaintAfterLoadTime: 0,
                            navigationType: "Other",
                            requestTime: Date.now() / 1000,
                            startLoadTime: Date.now() / 1000,
                            finishDocumentLoadTime: Date.now() / 1000,
                            finishLoadTime: Date.now() / 1000,
                            firstPaintChromeTime: Date.now() / 1000,
                            wasAlternateProtocolAvailable: false,
                            wasFetchedViaSpdy: false,
                            wasNpnNegotiated: false,
                            npnNegotiatedProtocol: "http/1.1",
                            connectionInfo: "h2",
                        };
                    },
                    app: {
                        isInstalled: false,
                        getDetails: function(){},
                        getIsInstalled: function(){},
                        installState: function(){
                            return "disabled";
                        },
                        runningState: function(){
                            return "cannot_run";
                        }
                    },
                    csi: function() {
                        return {
                            startE: Date.now(),
                            onloadT: Date.now(),
                            pageT: Date.now(),
                            tran: 15
                        };
                    }
                };
            };
            
            // 4. 伪装通知API
            const overrideNotification = () => {
                if (window.Notification) {
                    Object.defineProperty(window.Notification, 'permission', {
                        get: () => "default"
                    });
                }
            };
            
            // 5. 伪造Canvas指纹
            const overrideCanvas = () => {
                try {
                    const originalGetContext = HTMLCanvasElement.prototype.getContext;
                    // @ts-ignore
                    HTMLCanvasElement.prototype.getContext = function(contextType) {
                        const contextId = arguments[0];
                        const options = arguments.length > 1 ? arguments[1] : undefined;
                        const context = originalGetContext.call(this, contextId, options);
                        
                        if (contextType === '2d' && context) {
                            // @ts-ignore
                            const originalFillText = context.fillText;
                            // @ts-ignore
                            context.fillText = function() {
                                const args = Array.from(arguments);
                                if (args.length > 0 && typeof args[0] === 'string') {
                                    args[0] = args[0] + ' '; // 添加空格来改变文本
                                }
                                return originalFillText.apply(this, args);
                            };
                            
                            // @ts-ignore
                            const originalGetImageData = context.getImageData;
                            // @ts-ignore
                            context.getImageData = function() {
                                const args = Array.from(arguments);
                                const imageData = originalGetImageData.apply(this, args);
                                if (imageData && imageData.data && imageData.data.length > 0) {
                                    // 轻微修改像素数据，使其更难被追踪
                                    for (let i = 0; i < 10; i++) {
                                        const offset = Math.floor(Math.random() * imageData.data.length);
                                        imageData.data[offset] = imageData.data[offset] ^ 1; // 改变一个位
                                    }
                                }
                                return imageData;
                            };
                        }
                        return context;
                    };
                } catch (e) {
                    console.log('Canvas指纹修改失败，但继续执行', e);
                }
            };
            
            // 6. 隐藏自动化特征
            const hideAutomationFeatures = () => {
                // 隐藏Playwright特征
                Object.defineProperty(window, 'outerWidth', {
                    get: function() { return window.innerWidth; }
                });
                Object.defineProperty(window, 'outerHeight', {
                    get: function() { return window.innerHeight; }
                });
                
                // 阻止检测自动化的navigator特性
                Object.defineProperty(navigator, 'plugins', {
                    get: function() {
                        // 常见插件
                        const fakePlugins = [];
                        const flash = { name: 'Shockwave Flash', description: 'Shockwave Flash 32.0 r0', filename: 'internal-flash.plugin', version: '32.0.0' };
                        const pdf = { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf.plugin', version: '1.0' };
                        const pdfViewer = { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', version: '1.0' };
                        
                        // @ts-ignore
                        fakePlugins.push(flash, pdf, pdfViewer);
                        
                        // 添加可迭代性
                        // @ts-ignore
                        fakePlugins.item = function(index) { return this[index]; };
                        // @ts-ignore
                        fakePlugins.namedItem = function(name) { 
                            // @ts-ignore
                            return this.find(p => p.name === name); 
                        };
                        // @ts-ignore
                        fakePlugins.refresh = function() {};
                        
                        return fakePlugins;
                    }
                });
                
                // 伪造指纹特征
                const originalQuery = Element.prototype.querySelectorAll;
                // @ts-ignore
                Element.prototype.querySelectorAll = function(selector) {
                    if (selector && selector.includes(':target')) {
                        // 扰乱指纹
                        return document.createElement('div');
                    }
                    return originalQuery.apply(this, [...arguments]);
                };
                
                // 无头模式特殊修复 - 修复window.Notification
                if (window.Notification === undefined) {
                    // @ts-ignore
                    window.Notification = {
                        permission: 'default',
                        requestPermission: function() {
                            return Promise.resolve('default');
                        }
                    };
                }
                
                // 修复headless Chrome检测
                // 模拟浏览器连接
                // @ts-ignore
                if (!navigator.connection) {
                    // @ts-ignore
                    navigator.connection = {
                        downlink: 10 + Math.random() * 5,
                        effectiveType: "4g",
                        onchange: null,
                        rtt: 50 + Math.random() * 30,
                        saveData: false
                    };
                }
                
                // 修复无头WebDriver检测
                Object.defineProperty(navigator, 'userAgent', {
                    get: function() {
                        return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
                    }
                });
                
                // 模拟媒体设备
                if (navigator.mediaDevices === undefined) {
                    // @ts-ignore
                    navigator.mediaDevices = {
                        enumerateDevices: function() {
                            return Promise.resolve([
                                {kind: 'audioinput', deviceId: 'default', groupId: 'default', label: ''},
                                {kind: 'videoinput', deviceId: 'default', groupId: 'default', label: ''}
                            ]);
                        }
                    };
                }
            };
            
            // 7. 阻止指纹收集
            const blockFingerprinting = () => {
                // 阻止FP收集常用的脚本
                Object.defineProperty(performance, 'mark', {
                    value: function() {
                        // 记录性能但如果调用与fingerprint相关就扰乱
                        const args = Array.from(arguments);
                        if (args.length > 0 && typeof args[0] === 'string' && 
                            (args[0].includes('finger') || args[0].includes('detect') || args[0].includes('bot'))) {
                            return null;
                        }
                        return performance.mark.apply(this, args as unknown as [string, any?]);
                    }
                });
                
                // 干扰AudioContext指纹
                if (window.AudioContext || (window as any).webkitAudioContext) {
                    const OriginalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    // @ts-ignore
                    window.AudioContext = (window as any).webkitAudioContext = function() {
                        const audioContext = new OriginalAudioContext();
                        const originalGetChannelData = audioContext.createAnalyser().getFloatFrequencyData;
                        // @ts-ignore
                        audioContext.createAnalyser().getFloatFrequencyData = function(array) {
                            const result = originalGetChannelData.apply(this, [...arguments]);
                            // 轻微改变音频数据
                            if (array && array.length > 0) {
                                for (let i = 0; i < array.length; i += 200) {
                                    array[i] = array[i] + Math.random() * 0.01;
                                }
                            }
                            return result;
                        };
                        return audioContext;
                    };
                }
                
                // 无头模式特殊处理 - 修复语音合成
                if (window.speechSynthesis === undefined) {
                    // @ts-ignore
                    window.speechSynthesis = {
                        pending: false,
                        speaking: false,
                        paused: false,
                        onvoiceschanged: null,
                        getVoices: function() { return []; },
                        speak: function() {},
                        cancel: function() {},
                        pause: function() {},
                        resume: function() {}
                    };
                }
            };
            
            // 8. 无头浏览器专用反检测
            const antiHeadlessDetection = () => {
                // 模拟物理屏幕尺寸
                Object.defineProperty(screen, 'availWidth', {
                    get: function() { return window.innerWidth; }
                });
                Object.defineProperty(screen, 'availHeight', {
                    get: function() { return window.innerHeight; }
                });
                Object.defineProperty(screen, 'width', {
                    get: function() { return window.innerWidth; }
                });
                Object.defineProperty(screen, 'height', {
                    get: function() { return window.innerHeight; }
                });
                
                // 模拟WebGL2
                if (window.WebGL2RenderingContext) {
                    const getParameterProto = WebGL2RenderingContext.prototype.getParameter;
                    // @ts-ignore
                    WebGL2RenderingContext.prototype.getParameter = function(parameter) {
                        if (parameter === 37445) {
                            return 'Intel Open Source Technology Center';
                        }
                        if (parameter === 37446) {
                            return 'Mesa DRI Intel(R) HD Graphics 630 (Kaby Lake GT2)';
                        }
                        return getParameterProto.apply(this, [...arguments]);
                    };
                }
                
                // 处理无头模式中navigator.plugins和mimeTypes
                if (navigator.plugins.length === 0) {
                    Object.defineProperty(navigator, 'plugins', {
                        get: function() {
                            const ChromePDFPlugin = { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' };
                            const FakeMimeType = { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' };
                            
                            // @ts-ignore
                            ChromePDFPlugin.__proto__ = MimeType.prototype;
                            const pluginArray = [ChromePDFPlugin];
                            
                            // @ts-ignore
                            pluginArray.item = function(index) { return this[index]; };
                            // @ts-ignore
                            pluginArray.namedItem = function(name) { return this[0].name === name ? this[0] : null; };
                            // @ts-ignore
                            pluginArray.refresh = function() {};
                            // @ts-ignore
                            pluginArray.length = 1;
                            
                            return pluginArray;
                        }
                    });
                }
                
                if (navigator.mimeTypes.length === 0) {
                    Object.defineProperty(navigator, 'mimeTypes', {
                        get: function() {
                            const mimeTypes = [
                                { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: {} }
                            ];
                            
                            // @ts-ignore
                            mimeTypes.item = function(index) { return this[index]; };
                            // @ts-ignore
                            mimeTypes.namedItem = function(name) { return this[0].type === name ? this[0] : null; };
                            // @ts-ignore
                            mimeTypes.length = 1;
                            
                            return mimeTypes;
                        }
                    });
                }
            };
            
            // 执行所有伪装
            try {
                overrideNavigator();
                overrideWebGL();
                overrideChrome();
                overrideNotification();
                overrideCanvas();
                hideAutomationFeatures();
                blockFingerprinting();
                antiHeadlessDetection(); // 添加无头浏览器专用反检测
            } catch (err) {
                // 忽略错误继续执行
            }
        });
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
