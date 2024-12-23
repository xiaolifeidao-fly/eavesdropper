import { MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";


export class MbShopInfoMonitor extends MbMonitorResponse<{}>{

    getApiName(): string{
        return "mtop.taobao.jdy.resource.shop.info.get";
    }

    getKey(): string{
        return "shopInfo";
    }

}