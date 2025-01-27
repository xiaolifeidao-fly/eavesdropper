
import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopApi } from "@eleapi/door/shop/mb.shop";

import { MbEngine } from "@src/door/mb/mb.engine";
import { MbShopInfoMonitor } from "@src/door/monitor/mb/shop/md.shop.monitor";
import log from "electron-log";

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
            const navigatorResult = await page.evaluate(() => {
                // @ts-ignore
                const navigatorObj = navigator;
                const result : any = {};
                for(let key in navigatorObj){
                    result[key] = navigatorObj[key];
                }
                return result;
            });
            log.info("navigatorResult is ", navigatorResult);
            const result = await engine.openWaitMonitor(page, "https://myseller.taobao.com/home.htm/shop-manage/shop-center", monitor);
            log.info("shop result is ", result);
            return result;
        }catch(error){
            log.error("findMbShopInfo error", error);
        }finally{
            await engine.closePage();
        }  
    }


}

