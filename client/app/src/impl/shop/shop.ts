require('module-alias/register');

import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { MdShopInfoMonitor } from "@src/door/mb/impl/md.shop.info.engine";
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
            const monitor = new MdShopInfoMonitor();
            engine.addMonitor(monitor);
            await engine.startMonitor();
            const doorEntity = await monitor.waitForAction();
            return doorEntity;
        }finally{
            await engine.closePage();
        }  
    }



}

