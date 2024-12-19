require('module-alias/register');

import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbUserApi } from "@eleapi/door/user/user";

import { MbEngine } from "@src/door/mb/mb.engine";
import { MbUserInfoMonitor } from "@src/door/monitor/mb/user/md.user.monitor";


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
            return await engine.openWaitMonitor(page, "https://www.taobao.com/", monitor);
        }finally{
            await engine.closePage();
        }  
    }


}

