
import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { getPlatform, setPlatform } from "@src/door/engine";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";
import { get } from "@utils/store/electron";
import log from "electron-log";

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
            let loginResult = false;
            monitor.setHandler(async (request, response) => {
                log.info("login monitor request ", await request?.allHeaders());
                engine.saveContextState();
                loginResult = true;
                return { "loginResult": true };
            });
            const result = await engine.openWaitMonitor(page, url, monitor);
            log.info("login result is ", result);
            const platform = await setPlatform(page);
            log.info("login platform is ", JSON.stringify(platform));
            return result;
        }catch(error){
            log.error("login error", error);
        }finally{
            await engine.closePage();
            // await engine.release();
        }  
    }



}

