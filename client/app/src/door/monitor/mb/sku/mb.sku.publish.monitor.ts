import { DoorEntity } from "@src/door/entity";
import { Response } from "playwright-core";
import { MbMonitorResponse } from "../mb.monitor";

export class MbSkuPublishListMonitor extends MbMonitorResponse<{}>{

    resourceId : number;

    constructor(resourceId : number){
        super();
        this.resourceId = resourceId;
    }

    getApiName(): string | string[] {
        return "mtop.taobao.sell.pc.manage.async";
    }
    getKey(): string {
        return "skuPublishList";
    }


}
