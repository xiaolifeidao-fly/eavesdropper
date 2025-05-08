import { PxxLoginMonitor } from "@src/door/monitor/pxx/login/pxx.login.monitor";
import { PxxEngine } from "@src/door/pxx/pxx.engine";
import log from "electron-log";
import { MonitorPxxSkuApi } from "@eleapi/door/sku/pxx.sku";
import { InvokeType, Protocols } from "@eleapi/base";
import { BrowserContext } from "playwright-core";
import { getUrlParameter } from "@utils/url.util";
import { getDoorRecord, saveDoorRecord } from "@api/door/door.api";
import { DoorRecord } from "@model/door/door";
import { PxxLoginApi } from "@eleapi/door/login/pxx.login";

import { bindResource } from "@api/resource/resource.api";
import { BindResourceReq } from "@model/resource/resource";
import { getPlatform, getSecChUa } from "@src/door/engine";
import { BrowserView, BrowserWindow, session } from "electron";
import path from "path";
import { PDD } from "@enums/source";

const monitor = new PxxLoginMonitor();

const monitorConfig : {[key : number] : any} = {};







export class MonitorPxxLogin extends PxxLoginApi {

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

    async createPddWindow(resourceId : number){
        const pddHomeUrl = "https://mobile.yangkeduo.com/personal_profile.html";
        const sessionInstance = session.fromPartition(`persist:-${resourceId}-session`, { cache: true });
        
        const platform = await getPlatform();
        const secChUa = getSecChUa(platform);
        sessionInstance.webRequest.onBeforeSendHeaders(async (details,callback) => {
            const header = details.requestHeaders;
            if(platform){
                for(const key in header){
                    const lowerKey = key.toLowerCase();
                    if(lowerKey == "sec-ch-ua"){
                        header[key] = secChUa;
                    }
                    if(lowerKey == "sec-ch-ua-mobile"){
                        header[key] = "?0";
                    }
                    if(lowerKey == "sec-ch-ua-platform"){
                        header[key] = `"${platform?.userAgentData?.platform}"`;
                    }
                    if(lowerKey == 'user-agent'){
                        header[key] = platform?.userAgent;
                    }
                }
            }
            callback({requestHeaders: header});
        });


        sessionInstance.webRequest.onCompleted(async (details) => {
            const requestUrl = details.url;
            if(requestUrl.includes("personal_profile.html")){
                try{
                    const monitorKey = "PxxSkuMonitor";
                    const code = await this.getPxxCode();
                    const rawData = await windowInstance.webContents.executeJavaScript(code);
                    if(rawData){
                        this.saveByJson(resourceId, rawData, requestUrl, monitorKey, "PxxLogin", PDD);
                    } else {
                        log.info("row data not found");
                    }
                }catch(error){
                    log.error("send onGatherToolLoaded error ", error);
                }
            }
        });
    
        const windowInstance = new BrowserWindow({
            width: 1090-450,
            height: 1080,
            webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webviewTag: true, // 启用 webview 标签
            session: sessionInstance,
            // devTools: true,
            webSecurity: false,
            nodeIntegration: true // 启用Node.js集成，以便在渲染进程中使用Node.js模块
            }
        });

        // 将 BrowserView 附加到主窗口
        windowInstance.webContents.loadURL("https://mobile.yangkeduo.com/personal_profile.html");
    }

    @InvokeType(Protocols.INVOKE)
    async login(resourceId : number){
        await this.createPddWindow(resourceId);
    }


    saveLoginInfo(resourceId : number, context : BrowserContext|undefined, type : string){
        if(!context || monitorConfig[resourceId]){
            return;
        }
        log.info("context on page ");
        const monitorKey = "PxxSkuMonitor";
        context.on("response", async response => {
            const request = response.request();
            const requestUrl = request.url();
            if(requestUrl.includes("personal_profile.html")){
                const rawData = await this.getRawData(response);
                if(rawData){
                    this.saveByJson(resourceId, rawData, requestUrl, monitorKey, "PxxLogin", type);
                } else {
                    log.info("row data not found");
                }
                return;
            }
        });
        monitorConfig[resourceId] = true;
    }

    async getRawData(response : any){
        const responseData = await response.text();
        const match = responseData.match(/window\.rawData\s*=\s*({.*})/);
        if(match){
            let rawData = match[0];
            return rawData.substring(rawData.indexOf("{"), rawData.length);
        } else {
            log.info("row data not found");
            return undefined;
        }
    }

    async saveByJson(resourceId : number, rawData : string, url : string, doorKey : string, itemKey : string, type : string){
        try{
            const jsonData = JSON.parse(rawData);
            const nickname = jsonData.stores?.store?.userInfo?.nickname;
            if(!nickname){
                log.warn(itemKey, " nickname not found");
                return;
            }
            const bindResourceReq = new BindResourceReq(nickname, nickname, 1);
            const result = await bindResource(resourceId, bindResourceReq);
            log.info("bind resource success ", itemKey, result);
        } catch(error){
            log.error("save by json error ", error);
        }
    }

}
