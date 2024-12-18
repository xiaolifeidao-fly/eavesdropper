require('module-alias/register');
import { MbMonitorChain, MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import { Monitor, MonitorChain } from "../../monitor";



export class MbSkuInfoMonitor extends MbMonitorResponse{

    public async isMatch(url : string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.pcdetail.data.get") && method == "GET"){
            return true;
        }
        return false;
    }

    getKey(): string{
        return "skuInfo";
    }

}


export class MbSkuDetailMonitor extends MbMonitorResponse{

    public async isMatch(url: string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.detail.getdesc") && method == "GET"){
            return true;
        }
        return false;
    }

    getKey(): string{
        return "skuDetail";
    }

}


export class MbShopDetailMonitorChain extends MbMonitorChain{
    
    initMonitors(): Monitor[] {
        return [new MbSkuInfoMonitor(), new MbSkuDetailMonitor()];
    }


}
