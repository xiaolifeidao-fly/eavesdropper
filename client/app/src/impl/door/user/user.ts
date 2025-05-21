
import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbUserApi } from "@eleapi/door/user/user";

import { MbEngine } from "@src/door/mb/mb.engine";
import { MbUserInfoMonitor } from "@src/door/monitor/mb/user/md.user.monitor";
import log from "electron-log";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";
import { StoreApiImpl } from "@src/impl/store/store";
import { getTodayDateString } from "@utils/date";

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

    @InvokeType(Protocols.INVOKE)
    async openUserInfo(resourceId : number) {
        const url = "https://myseller.taobao.com/home.htm/QnworkbenchHome/";
        const engine = new MbEngine<{}>(resourceId, false);
        try{
            const page = await engine.init();
            if(!page){ 
                return;
            }
            const monitor = new MdLoginMonitor();
            monitor.setMonitorTimeout(60000);
            let loginResult = false;
            monitor.setHandler(async (request : any, response : any) => {
                const header = await request?.allHeaders();
                log.info("login monitor request ", header);
                engine.saveContextState();
                loginResult = true;
                return { "loginResult": true };
            });
            setTimeout(async () => {
                 await engine.openWaitMonitor(page, url, monitor, {});
            }, 1000);
        }catch(error){
            log.error("login error", error);
        }
    }

    @InvokeType(Protocols.INVOKE)
    async getUserOnlineStatus(resourceId: number) {
        const key = `resource_online_status`
        const storeApi = new StoreApiImpl()
        // 先从缓存中获取
        let accountStatueMap = await storeApi.getItem(key)
        if (!accountStatueMap) {
            accountStatueMap = new Map()
        }

        const today = getTodayDateString()
        if (accountStatueMap.has(resourceId)) {
            const onlineDate = accountStatueMap.get(resourceId)
            if (onlineDate) {
                // 判断在线日期是否为当天
                if (onlineDate === today) {
                    return true
                }
            }
        }

        // 获取资源账号在线状态
        const result = await this.getUserInfo(resourceId)
        const online = result && result.code ? true : false

        // 缓存资源账号在线状态
        if (online) {
            accountStatueMap.set(resourceId, today)
        }
        await storeApi.setItem(key, accountStatueMap)
        return online
    }

}

