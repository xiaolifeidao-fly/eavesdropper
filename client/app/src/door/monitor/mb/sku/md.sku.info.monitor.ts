import { MbMonitorChain, MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import { Monitor, MonitorChain } from "../../monitor";
import {Response} from 'playwright'
import log from "electron-log";
import { DoorEntity } from "@src/door/entity";


export class MbSkuInfoMonitor extends MbMonitorResponse<{}>{

    getApiName(): string[]{
        return ["mtop.taobao.pcdetail.data.get","error.item.taobao.com/error/noitem"];
    }

    getKey(): string{
        return "skuInfo";
    }

}


export class MbSkuDetailMonitor extends MbMonitorResponse<{}>{

    getApiName(): string[]{
        return ["mtop.taobao.detail.getdesc","error.item.taobao.com/error/noitem"];
    }

    getKey(): string{
        return "skuDetail";
    }

}


export class SearchSkuMonitor extends MbMonitorResponse<{}>{

    getApiName(): string[]{
        return ["mtop.relationrecommend.wirelessrecommend.recommend/2.0"];
    }

    getKey(): string{
        return "searchSku";
    }

    public async getResponseData(response: Response): Promise<DoorEntity<{}>> {
        try{
            if(response.url().includes("error.item.taobao.com/error/noitem")){
                return new DoorEntity<{}>(false, {});
            }
            const result = await this.getJsonFromResponse(response);
            if(!result){
                return new DoorEntity<{}>(false, {});
            }
            if('ret' in result){
                const doorEntity = this.buildDoorEntity(result);
                if(doorEntity){
                    return doorEntity;
                }
            }
            if('data' in result){
                const data = result.data;
                return new DoorEntity<{}>(true, data);
            }
            return new DoorEntity<{}>(false, {});
        }catch(e){
            log.error("MbSkuInfoMonitor getResponseData error", e);
            return new DoorEntity<{}>(false, {});
        }
    }

}

export class MbShopDetailMonitorChain extends MbMonitorChain<{}>{
    
    initMonitors(): Monitor<{}>[] {
        return [new MbSkuInfoMonitor(), new MbSkuDetailMonitor()];
    }

    getItemKey(params: URLSearchParams): string | undefined {
        const id = params.get("id");
        if(id){
            return id;
        }
        return undefined;
    }

}


export class MbPublishSearchMonitor extends MbMonitorResponse<{}>{
    getKey(): string {
        return "publishSearch";
    }

    getApiName(): string[] {
        return ["sell/ai/category.htm"];
    }

    public needResponseHeaderData(): boolean{
        return true;
    }

    public async getResponseData(response: Response): Promise<DoorEntity<{}>> {
        return new DoorEntity(true, {})
    }

    
}

export class OpenPublishPageMonitor extends MbMonitorResponse<{}>{

    getKey(): string {
        return "openPublishPage";
    }

    getApiName(): string[] {
        return ["sell/v2/publish.htm"];
    }

    public needHeaderData(): boolean {
        return true;
    }

    public needRequestBody(): boolean {
        return true;
    }

    public needUrl(): boolean {
        return true;
    }

    public async getResponseData(response: Response): Promise<DoorEntity<{}>>{
        const contentType = response.headers()['content-type'];
        if(contentType.includes('application/json')){
            const result =  await response.json();
            const ret = result.ret;
            if(Array.isArray(ret)){
                const retCode = ret[0];
                if(retCode == 'FAIL_SYS_USER_VALIDATE'){
                    log.error("getResponseData error ", result);
                    const data = result.data as { [key: string]: any };
                    const doorEntity = new DoorEntity<{}>(false, data as {});
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
            }
            return new DoorEntity<{}>(true, result as {});
        }
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            return new DoorEntity<{}>(false, text as {});
        }
        const body = await response.body();
        return new DoorEntity<{}>(false, body as {});
    }
    
}


export class MbSkuPublishDraffMonitor extends MbMonitorResponse<{}>{

    getApiName(): string[] {
        return ["draftOp/add.json", "draftOp/update.json"]
    }
    getKey(): string {
        return "sku_publish"
    }

    public needHeaderData(): boolean {
        return true;
    }

    public needRequestBody(): boolean {
        return true;
    }

    public needUrl(): boolean {
        return true;
    }

    public async getResponseData(response: Response): Promise<DoorEntity<{}>>{
        const contentType = response.headers()['content-type'];
        if(contentType.includes('application/json')){
            const result =  await response.json();
            const ret = result.ret;
            if(Array.isArray(ret)){
                const retCode = ret[0];
                if(retCode == 'FAIL_SYS_USER_VALIDATE'){
                    log.error("getResponseData error ", result);
                    const data = result.data as { [key: string]: any };
                    const doorEntity = new DoorEntity<{}>(false, data as {});
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
            }
            return new DoorEntity<{}>(true, result as {});
        }
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            return new DoorEntity<{}>(false, text as {});
        }
        const body = await response.body();
        return new DoorEntity<{}>(false, body as {});
    }

}

export class MbSkuPublishMonitor extends MbSkuPublishDraffMonitor{

    async filter(url: string, resourceType: string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(resourceType == "image"){
            return true;
        }
        return false;
    }

    getApiName(): string[] {
        return ["sell/v2/submit.htm"];
    }

}