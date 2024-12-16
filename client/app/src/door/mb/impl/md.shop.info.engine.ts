require('module-alias/register');
import { DoorEntity } from "@src/door/entity";
import { Page, Request, Response, Route } from "playwright";
import { MbEngine } from "../mb.engine";
import { MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import log from "electron-log";
import { toJson } from "@utils/json";

export class MdShopInfoEngine extends MbEngine{

    doWaitFor(windowId: string, page: Page): Promise<{} | undefined> {
        throw new Error("Method not implemented.");
    }
    doCallback(doorEntity: DoorEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }

}


export class MdShopInfoMonitor extends MbMonitorResponse{

    public async isMatch(url : string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.pcdetail.data.get") && method == "GET"){
            return true;
        }
        return false;
    }

    public async getResponseData(response: Response): Promise<any> {
        try{
            const text = await response.text();
            // const data = toJson(text);
            return text;
        }catch(e){
            log.error("MdShopInfoMonitor getResponseData error", e);
            return undefined;
        }
    }

}