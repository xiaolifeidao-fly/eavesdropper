import { MbMonitorChain, MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import { Monitor, MonitorChain } from "../../monitor";
import {Response} from 'playwright'


export class MbSkuInfoMonitor extends MbMonitorResponse<{}>{

    getApiName(): string{
        return "mtop.taobao.pcdetail.data.get";
    }

    getKey(): string{
        return "skuInfo";
    }

}


export class MbSkuDetailMonitor extends MbMonitorResponse<{}>{

    getApiName(): string{
        return "mtop.taobao.detail.getdesc";
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

    public async getResponseData(response: Response): Promise<any>{
        const contentType = response.headers()['content-type'];
        if(contentType.includes('application/json')){
            const result =  await response.json();
            return result;
        }
        if (contentType && contentType.includes('text/html')) {
            return await response.text();
        }
        return await response.body();
    }

}

export class MbSkuPublishMonitor extends MbSkuPublishDraffMonitor{

    async filter(url: string, resourceType: string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(resourceType != "image"){
            return false;
        }
        return url.includes("https://img.alicdn.com/imgextra/i1");
    }

    getApiName(): string[] {
        return ["sell/v2/submit.htm"];
    }

}