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
        const apiNames = this.getApiName();
        if(Array.isArray(apiNames)){
            return apiNames.some(apiName => url.includes(apiName));
        }
        return url.includes(apiNames);
    }

    abstract getApiName(): string | string[];


    public async getJsonFromResponse(response: Response): Promise<{[key: string]: any}|undefined>{
        try{
            const json = await response.json();
            console.log("json is ", json);
            return json;
        }catch(e){
            const data = await response.text();
            return toJson(data);
        }
    }

    public async getResponseData(response: Response): Promise<DoorEntity<T>> {
        try{
            if(response.url().includes("error.item.taobao.com/error/noitem")){
                return new DoorEntity<T>(false, {} as T);
            }
            const result = await this.getJsonFromResponse(response);
            if(!result){
                return new DoorEntity<T>(true, result as T);
            }
            if('ret' in result){
                const ret = result.ret;
                if(Array.isArray(ret)){
                    const retCode = ret[0];
                    if(retCode == 'FAIL_SYS_USER_VALIDATE'){
                        log.error("getResponseData error ", result);
                        const data = result.data as { [key: string]: any };
                        const doorEntity = new DoorEntity<T>(false, data as T);
                        doorEntity.validateUrl = result.data?.url;
                        const validateParams : { [key: string]: any } =  {};
                        if('dialogSize' in data){
                            validateParams.dialogSize = data.dialogSize;
                        }
                        if('attributes' in data){
                            validateParams.attributes = data.attributes;
                        }
                        doorEntity.setValidateParams(validateParams);
                        return doorEntity;
                    }
                    if(retCode == undefined ||!retCode.includes("SUCCESS")){
                        return new DoorEntity<T>(false, {} as T);
                    }
                    return new DoorEntity<T>(true, result.data as T);
                }
            }
            return new DoorEntity<T>(false, {} as T);
        }catch(e){
            log.error("MbSkuInfoMonitor getResponseData error", e);
            return new DoorEntity<T>(false, {} as T);
        }
    }

}

export abstract class MbMonitorChain<T> extends MonitorChain<T>{

    getType(): string {
        return "MB"
    }
}