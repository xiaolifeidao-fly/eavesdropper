import { Response } from "playwright";
import { Monitor, MonitorChain, MonitorRequest, MonitorResponse } from "../monitor";
import { DoorEntity } from "@src/door/entity";
import { toJson } from "@utils/json";
import log from "electron-log";


export abstract class MbMonitorRequest<T> extends MonitorRequest<T> {


}

export abstract class MbMonitorResponse<T> extends MonitorResponse<T> {

    getType(): string{
        return "MB";
    }

    public async isMatch(url : string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes(this.getApiName())){
            return true;
        }
        return false;
    }

    abstract getApiName(): string;

    public async getResponseData(response: Response): Promise<any> {
        try{
            const data = await response.text();
            const jsonData = toJson(data);
            console.log("jsonDataObj ", jsonData);

            if(!jsonData){
                return undefined;
            }
            const jsonDataObj = jsonData as {data: any, ret: any[]};
            const ret = jsonDataObj.ret;
            if(ret == undefined || ret.length == 0){
                return undefined;
            }
            const retObj = ret[0];
            if(retObj == undefined ||!retObj.includes("SUCCESS")){
                return undefined;
            }
            return jsonDataObj.data;
        }catch(e){
            log.error("MbSkuInfoMonitor getResponseData error", e);
            return undefined;
        }
    }

}

export abstract class MbMonitorChain<T> extends MonitorChain<T>{

    getType(): string {
        return "MB"
    }
}