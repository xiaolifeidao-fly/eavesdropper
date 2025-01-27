
import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbUserApi } from "@eleapi/door/user/user";

import { MbEngine } from "@src/door/mb/mb.engine";
import { MbUserInfoMonitor } from "@src/door/monitor/mb/user/md.user.monitor";
import log from "electron-log";


export class MbUserApiImpl extends MbUserApi {

   
    @InvokeType(Protocols.INVOKE)
    async getUserInfo(resourceId : number) {
        const engine = new MbEngine(resourceId);
        try{
            const monitor = new MbUserInfoMonitor();
            const page = await engine.init();
            if(!page){ 
                return;
            }
            const result = await engine.openWaitMonitor(page, "https://www.taobao.com/", monitor);
            log.info("user result is ", result);
            return result;
        }finally{
            await engine.closePage();
        }  
    }


}

