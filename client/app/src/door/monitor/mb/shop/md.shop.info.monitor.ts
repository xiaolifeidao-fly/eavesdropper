require('module-alias/register');
import { DoorEntity } from "@src/door/entity";
import { Page, Request, Response, Route } from "playwright";
import { MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import log from "electron-log";
import { Monitor, MonitorChain } from "../../monitor";
import { toJson, extractJsonStr } from "@utils/json";
import { json } from "stream/consumers";



export class MbShopInfoMonitor extends MbMonitorResponse{

    public async isMatch(url : string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.pcdetail.data.get") && method == "GET"){
            return true;
        }
        return false;
    }

    public async getResponseData(response: Response): Promise<any> {
        try{
            const data = await response.text();
            const jsonData = toJson(data);
            if(!jsonData){
                return undefined;
            }
            const jsonDataObj = jsonData as {data: any};
            return jsonDataObj.data;
        }catch(e){
            log.error("MdShopInfoMonitor getResponseData error", e);
            return undefined;
        }
    }

    getKey(): string{
        return "shopInfo";
    }

}


export class MbShopDetailMonitor extends MbMonitorResponse{

    public async isMatch(url: string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.detail.getdesc") && method == "GET"){
            return true;
        }
        return false;
    }

    async getResponseData(response: Response): Promise<any> {
        try{
            const data = await response.text();
            const jsonData = toJson(data);
            if(!jsonData){
                return undefined;
            }
            const jsonDataObj = jsonData as {data: any};
            return jsonDataObj.data;
        }catch(e){
            log.error("MbShopDetailMonitor getResponseData error", e);
            return undefined;
        }
    }

    getKey(): string{
        return "shopDetail";
    }

}

export class MbShopDetailMonitorChain extends MonitorChain{
    
    initMonitors(): Monitor[] {
        return [new MbShopInfoMonitor(), new MbShopDetailMonitor()];
    }


}
