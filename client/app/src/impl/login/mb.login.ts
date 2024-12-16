require('module-alias/register');

import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import log from "electron-log";
import { ShopApi } from "@eleapi/shop/shop";
import { DoorEntity } from "@src/door/entity";
import wait from "@utils/wait";
import { MbLoginApi } from "@eleapi/login/mb.login";
import { MdLoginMonitor } from "@src/door/mb/impl/md.login.engine";
import { MbEngine } from "@src/door/mb/mb.engine";


export class MbLoginApiImpl extends MbLoginApi { 
    

    @InvokeType(Protocols.INVOKE)
    async login(url: string) {
        const engine = new MbEngine(2, false);
        try{
            const page = await engine.init();
            if(!page){ 
                return;
            }
            await page.goto(url);
            const monitor = new MdLoginMonitor();
            monitor.setHandler(async (request, response) => {
                engine.saveContextState();
                return {};
            });
            engine.addMonitor(monitor);
            await engine.startMonitor();
            return await monitor.waitForAction();
        }finally{
            await engine.closePage();
        }  
    }



}

