require('module-alias/register');
import { MbMonitorChain, MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import { Monitor, MonitorChain } from "../../monitor";



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
