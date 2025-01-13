
import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopApi } from "@eleapi/door/shop/mb.shop";

import { MbEngine } from "@src/door/mb/mb.engine";
import { MbShopInfoMonitor } from "@src/door/monitor/mb/shop/md.shop.monitor";


export class MbShopApiImpl extends MbShopApi {

    @InvokeType(Protocols.INVOKE)
    async findMbShopInfo(resourceId : number) {
        const engine = new MbEngine(resourceId);
        try{
            const monitor = new MbShopInfoMonitor();
            const page = await engine.init();
            if(!page){ 
                return;
            }
            return await engine.openWaitMonitor(page, "https://myseller.taobao.com/home.htm/shop-manage/shop-center", monitor);
        }finally{
            await engine.closePage();
        }  
    }


}

