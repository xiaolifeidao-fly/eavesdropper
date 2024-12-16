require('module-alias/register');

import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain, MbShopInfoMonitor } from "@src/door/monitor/mb/shop/md.shop.info.monitor";
import log from "electron-log";
import { ShopApi } from "@eleapi/shop/shop";
import { DoorEntity } from "@src/door/entity";
import wait from "@utils/wait";
import { MbEngine } from "@src/door/mb/mb.engine";



export class ShopApiImpl extends ShopApi { 
    

    @InvokeType(Protocols.INVOKE)
    async findMbShopInfo(url: string) {
        const engine = new MbEngine(1);
        try{
            const page = await engine.init();
            if(!page){ 
                return;
            }
            await page.goto(url);
            const monitorChain = new MbShopDetailMonitorChain();
            engine.addMonitorChain(monitorChain);
            await engine.startMonitor();
            const doorEntity = await monitorChain.waitForAction();
            return doorEntity;
        }finally{
            await engine.closePage();
        }  
    }



}

