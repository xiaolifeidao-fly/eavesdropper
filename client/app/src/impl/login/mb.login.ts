require('module-alias/register');

import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/login/mb.login";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";


export class MbLoginApiImpl extends MbLoginApi { 
    

    @InvokeType(Protocols.INVOKE)
    async login(url: string) {
        const engine = new MbEngine(1, false);
        try{
            const page = await engine.init();
            if(!page){ 
                return;
            }
            const monitor = new MdLoginMonitor();
            monitor.setHandler(async (request, response) => {
                engine.saveContextState();
                return {};
            });
            return await engine.openWaitMonitor(page, url, monitor);
        }finally{
            await engine.closePage();
        }  
    }



}

