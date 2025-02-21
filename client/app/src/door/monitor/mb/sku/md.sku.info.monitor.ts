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