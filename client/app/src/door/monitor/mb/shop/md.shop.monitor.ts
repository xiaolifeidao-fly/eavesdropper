import { MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";


export class MbShopInfoMonitor extends MbMonitorResponse{

    public async isMatch(url : string, method: string, headers: { [key: string]: string; }): Promise<boolean> {
        if(url.includes("mtop.taobao.jdy.resource.shop.info.get") && method == "GET"){
            console.log("MbShopInfoMonitor isMatch")
            return true;
        }
        return false;
    }

    getKey(): string{
        return "shopInfo";
    }

}