
import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";


export class MbLoginApiImpl extends MbLoginApi {


    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number, url: string) {
        const engine = new MbEngine<{}>(resourceId, false);
        try{
            const page = await engine.init();
            if(!page){ 
                return;
            }
            const monitor = new MdLoginMonitor();
            monitor.setMonitorTimeout(60000);
            monitor.setHandler(async (request, response) => {
                console.log("login monitor request ", await request?.allHeaders());
                engine.saveContextState();
                return {};
            });
            return await engine.openWaitMonitor(page, url, monitor);
        }finally{
            await engine.closePage();
        }  
    }



}

