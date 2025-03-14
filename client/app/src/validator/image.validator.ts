import { MbEngine } from "@src/door/mb/mb.engine";
import { ImageValidatorMonitor } from "@src/door/monitor/mb/validate/image.validator";
import { BrowserView, session } from "electron";
import path from "path";
import log from "electron-log"
import { DoorEntity } from "@src/door/entity";


const {app, BrowserWindow } = require('electron');

const createBrowserView = async (resourceId : number, header : {[key:string]:any}, validateUrl : string)=>{
    const sessionInstance = session.fromPartition(`persist:-validate-image-session`, { cache: true });
    await sessionInstance.clearData();
    // const cookieData = header["cookie"].split(';');
    // for(let cookieItem of cookieData){
    //     const cookieItemData = cookieItem.split('=');
    //     await sessionInstance.cookies.set({
    //         url: "https://stream-upload.taobao.com",
    //         name: cookieItemData[0].trim(),
    //         value: cookieItemData[1].trim(),
    //     });
    // }
     // 修改请求头
     console.log(header);
     sessionInstance.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['Referer'] = validateUrl;
        details.requestHeaders['Sec-Fetch-Dest'] = 'image';
        details.requestHeaders['Sec-Fetch-Mode'] = 'no-cors';
        details.requestHeaders['Sec-Fetch-Site'] = 'same-site';
        details.requestHeaders['sec-ch-ua-mobile'] = header["sec-ch-ua-mobile"];
        details.requestHeaders['sec-ch-ua-platform'] = header["sec-ch-ua-platform"];
        details.requestHeaders['sec-ch-ua'] = header["sec-ch-ua"];
        details.requestHeaders['user-agent'] = header['user-agent'];
        details.requestHeaders['cookie'] = header["cookie"];
        callback({ requestHeaders: details.requestHeaders });
    });

    // 创建 BrowserView
    // const browserView = new BrowserView({
    //     webPreferences: {
    //         session: sessionInstance
    //     }
    // });
    // 将 BrowserView 附加到主窗口
    // browserView.webContents.loadURL(validateUrl);
    const windowInstance = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
          session: sessionInstance,
          preload: path.join(__dirname, 'preload.js'),
          contextIsolation: true,
          webviewTag: true, // 启用 webview 标签
          webSecurity: false,
          nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
        }
      });
    // windowInstance.webContents.openDevTools();
    windowInstance.loadURL(validateUrl);
    // windowInstance.addBrowserView(browserView);
 }

class ValidateItem {
    waitResolve: (value: {header: {[key:string]:any}, result: boolean}) => void = () => {};
    waitPromise: Promise<{header: {[key:string]:any}, result: boolean}>;
    resourceId: number;
    header: {[key:string]:any};
    validateUrl: string;
    validateParams: { [key: string]: any } | undefined;
   
    constructor(resourceId: number, header: {[key:string]:any}, validateUrl: string, validateParams: { [key: string]: any } | undefined){
        this.resourceId = resourceId;
        this.header = header;
        this.validateUrl = validateUrl;
        this.validateParams = validateParams;
        this.waitPromise = new Promise<{header: {[key:string]:any}, result: boolean}>((resolve) => {
            this.waitResolve = resolve;
        });
    }

    public resolve(header: {[key:string]:any}, value: boolean){
        const result = {
            header : header,
            result : value
        }
        this.waitResolve(result);
    }

    public async wait(){
        return await this.waitPromise;
    }

}

class ValidateQueueProcessor {
    private queue: ValidateItem[] = [];
    private waiting: ((value: ValidateItem) => void)[] = [];

    // 非阻塞的 put 方法
    public put(item: ValidateItem): void {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            if (resolve) {
                resolve(item);
            }
        } else {
            this.queue.push(item);
        }
    }

    // 阻塞的 take 方法
    public take(): ValidateItem|undefined {
        if (this.queue.length > 0) {
            return this.queue.shift();
        }
        return undefined;
    }
}
const validateQueueProcessor = new ValidateQueueProcessor();

async function waitTimes(times : number){
    return await new Promise((resolve) => {
        setTimeout(resolve, times);
    });
}

export async function validate(resourceId : number, header : {[key:string]:any}, validateUrl : string, validateParams : { [key: string]: any } | undefined){
    const validateItem = new ValidateItem(resourceId, header, validateUrl, validateParams);
    validateQueueProcessor.put(validateItem);
    return await validateItem.wait();
}

checkValidate();

function encodeBase64(str : string) {
    return btoa(str);
}
function checkValidate(){
    setInterval(async () => {
        const validateItem = validateQueueProcessor.take();
        if(validateItem){
            const engine = new MbEngine(validateItem.resourceId, false);
            try{
                const page = await engine.init();
                const sessionDirPath = path.join(path.dirname(app.getAppPath()),'resource',"validate_image.html");
            if(page){
                let url = "file://" + sessionDirPath + "?iframeUrl=" + encodeBase64(validateItem.validateUrl);
                const validateParams = validateItem.validateParams;
                if(validateParams){
                    url += "&validateParams=" + encodeBase64(JSON.stringify(validateParams));
                }
                let result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor());
                let validateNum = 0;
                while(!isValidateSuccess(result) && validateNum <=3 ){
                    validateNum++;
                    log.info("checkValidate error retry validate ", validateNum);
                    engine.resetMonitor();
                    result = await engine.openWaitMonitor(page, url, new ImageValidatorMonitor());
                }
                if(isValidateSuccess(result)){
                    validateItem.resolve(result.getHeaderData(), true);
                }else{
                    validateItem.resolve({}, false);
                }
            }
            } catch(error){
                log.error("checkValidate error", error);
                validateItem.resolve({}, false);
            }finally{
                engine.closePage();
            }
        }   
    }, 1000);
}


function isValidateSuccess(result : DoorEntity<any>){
    if(!result || !result.getCode()){
        return false;
    }
    return true;
}



