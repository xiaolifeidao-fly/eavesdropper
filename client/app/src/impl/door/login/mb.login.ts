
import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { getPlatform, setPlatform } from "@src/door/engine";
import { DoorEntity } from "@src/door/entity";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";
import { get } from "@utils/store/electron";
import { app } from "electron";
import log from "electron-log";
import path from "path";
import { Page } from "playwright-core";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
async function openLoginPageAction(page : Page){
    try{
        const element = await page.$("#qrcode-img"); // 选择要截图的元素
        if (element) {
            const qrCodeFileName = uuidv4() + ".png";
            const qrCodeFilePath = path.join(path.dirname(app.getAppPath()),'resource','temp', qrCodeFileName);
            await element.screenshot({ path: qrCodeFilePath}); // 保存截图
            const fileUrl = `localfile://${qrCodeFilePath}`;
            return new DoorEntity<{qrCodeFilePath: string, fileUrl: string}>(true, {qrCodeFilePath: qrCodeFilePath, fileUrl : fileUrl});
        }
    }catch(error){
        log.error("openLoginPageAction error", error);
    }
    const isLogin = await checkIsLogin(page);
    log.info("isLogin is ", isLogin);
    if(isLogin){
        return new DoorEntity<{}>(true);
    }
    return new DoorEntity<{}>(false,undefined);
}

async function checkIsLogin(page : Page){
    const element = await page.$(".site-nav-user"); // 选择要截图的元素
    if (element) {
        return true;
    }
    return false;
}

export class MbLoginApiImpl extends MbLoginApi {

    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number) {
        const url = "https://login.taobao.com/member/login.jhtml";
        const engine = new MbEngine<{}>(resourceId, true);
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
            const result = await engine.openNotWaitMonitor(page, url, monitor, {}, openLoginPageAction);
            const qrCodeData : { [key: string]: string; } | undefined = result.getData();
            setTimeout(async () => {
                this.handlerLoginResult(engine, resourceId, monitor, result, qrCodeData);
            }, 1000);
            return result;
        }catch(error){
            log.error("login error", error);
        }
    }

    async handlerLoginResult(engine: MbEngine<{}>,resourceId : number, monitor: MdLoginMonitor, result: DoorEntity<{}>, qrCodeData : { [key: string]: string; } | undefined){
        try{
            const monitorResult = await monitor.waitForAction();
            // fs 删除二维码图片
            if(!result.getCode() || !qrCodeData){
                this.send("onMonitorLoginResult", resourceId, false); // 发送登录接过
                return;
            }
            if(Object.keys(qrCodeData).length == 0){
                this.send("onMonitorLoginResult", resourceId, false); // 发送登录接过
                return;
            }
            log.info("login result is ", monitorResult);
            this.send("onMonitorLoginResult", resourceId, true); // 发送登录接过
            const qrCodeFilePath = qrCodeData['qrCodeFilePath'];
            if(qrCodeFilePath && fs.existsSync(qrCodeFilePath as string)){
                fs.unlinkSync(qrCodeFilePath as string);
            }
        } finally{
            engine.closePage();
        }
    }



}

