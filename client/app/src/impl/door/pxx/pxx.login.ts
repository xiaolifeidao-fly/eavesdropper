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

const monitor = new PxxLoginMonitor();

const monitorConfig : {[key : number] : any} = {};


export class MonitorPxxLogin extends PxxLoginApi {

    @InvokeType(Protocols.INVOKE)
    async login(resourceId : number){
        log.info("login pxx resourceId is ", resourceId);
        try{
            const engine = new PxxEngine(resourceId, false);
            const url = "https://mobile.yangkeduo.com/personal_profile.html";
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
                this.saveLoginInfo(resourceId, context, monitor.getType());
            }
            return result;
        } catch(error){
            log.error("login error", error);
        }
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
