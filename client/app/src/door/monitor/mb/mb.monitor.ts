require('module-alias/register');
import { Response } from "playwright";
import { Monitor, MonitorChain, MonitorRequest, MonitorResponse } from "../monitor";
import { DoorEntity } from "@src/door/entity";
import { toJson } from "@utils/json";
import log from "electron-log";


export abstract class MbMonitorRequest extends MonitorRequest{


}

export abstract class MbMonitorResponse extends MonitorResponse {

    getType(): string{
        return "MB";
    }

    public async getResponseData(response: Response): Promise<any> {
        try{
            const data = await response.text();
            const jsonData = toJson(data);
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

export abstract class MbMonitorChain extends MonitorChain{

    getType(): string {
        return "MB"
    }
}