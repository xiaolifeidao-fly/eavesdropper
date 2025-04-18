
import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { DoorEngine, getPlatform, setPlatform } from "@src/door/engine";
import { DoorEntity } from "@src/door/entity";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdInputLoginInfoMonitor, MdLoginMonitor, MdSendValidateCodeMonitor } from "@src/door/monitor/mb/login/md.login.monitor";
import { get } from "@utils/store/electron";
import { app } from "electron";
import log from "electron-log";
import path from "path";
import { Frame, Page } from "playwright-core";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import { validate } from "@src/validator/image.validator";

const loginEngineMap : { [key: string]: DoorEngine; } = {};

async function getLoginEngine(resourceId : number){
    if(!loginEngineMap[resourceId]){
        const engine = new MbEngine<{}>(resourceId);
        await engine.init();
        loginEngineMap[resourceId] = engine;
        return engine;
    }
    return loginEngineMap[resourceId];
}

function setLoginEngine(resourceId : number, engine : DoorEngine){
    loginEngineMap[resourceId] = engine;
}   

function removeLoginEngine(resourceId : number){
    delete loginEngineMap[resourceId];
}


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


async function inputLoginInfo(page : Page, ...params : any[]){
    await page.waitForTimeout(2000);
    const username = params[0];
    const password = params[1];
    const frame = await getFrame(page, "mini_login.htm");
    if(!frame){
        log.error("inputLoginInfo frame is null");
        return new DoorEntity<{}>(true, {"result" : "1", "message" : "当前已经是登录状态,无需登录"});
    }
    await frame.locator("#fm-login-id").first().fill(username);
    await frame.locator("#fm-login-password").first().fill(password);
    log.info("inputLoginInfo fill username and password");
    await frame.locator(".fm-button.fm-submit.password-login ").first().click();
}

async function fillValidateCode(page : Page, ...params : any[]){
    const frame = await getFrame(page, "identity_verify.htm");
    if(!frame){
        log.error("sendValidateCode frame is null");
        return;
    }
    await frame.locator("#J_GetCode").first().click();
    log.info("sendValidateCode click validate code ");
}   

async function getFrame(page: Page, frameName: string) {
    const frame = await page.mainFrame();
    for (const child of frame.childFrames()) {
        if (child.url().includes(frameName)) {
            return child;
        }
    }
    return undefined;
}
export class MbLoginApiImpl extends MbLoginApi {


    @InvokeType(Protocols.INVOKE)
    async inputLoginInfo(resourceId: number, username: string, password: string) {
        try{
            const engine = await getLoginEngine(resourceId);
            if(!engine){
                log.error("inputLoginInfo engine is null");
                return new DoorEntity<{}>(false, "系统错误");
            }
            const page = engine.getPage();
            if(!page){
                log.error("inputLoginInfo page is null");
                return new DoorEntity<{}>(false, "系统错误");
            }
            const monitor = new MdInputLoginInfoMonitor();
            monitor.setMonitorTimeout(60000);
            const result = await engine.openWaitMonitor(page, "https://myseller.taobao.com/home.htm/QnworkbenchHome/", monitor, {}, inputLoginInfo, username, password);
            log.info("inputLoginInfo result is ", result);
            if(!result.getCode() && result.validateUrl){
                const validateResult = await validate(resourceId, result.getHeaderData(), result.validateUrl, result.validateParams);
                if(!validateResult){
                    return new DoorEntity<{}>(false, "验证码验证失败");
                }
                await engine.saveContextState();
                return new DoorEntity<{}>(false, "验证图形验证码成功,请再次登录");
            }
            log.info("inputLoginInfo result is ", result);
            if(result.getCode()){
                const resultData = result.getData();
                if(resultData.result == "1"){
                    log.info("inputLoginInfo login success", result.getHeaderData());
                    await engine.saveContextState();
                    return new DoorEntity<{}>(true, resultData.message);
                }
                if(resultData.result == "2"){
                    return result;
                }
                return new DoorEntity<{}>(false, resultData.message);
            }
            return new DoorEntity<{}>(false,"发生未知异常");
        }catch(error : any){
            log.error("inputLoginInfo error", error);
            return new DoorEntity<{}>(false, "登录失败");
        }
    }

    
    @InvokeType(Protocols.INVOKE)
    async sendValidateCode(resourceId: number) {
        const engine = await getLoginEngine(resourceId);
        if(!engine){
            return new DoorEntity<{}>(false, "系统错误");
        }
        const page = engine.getPage();
        if(!page){
            return new DoorEntity<{}>(false, "系统错误");
        }
        const validateResult = await this.sendValidateCodeByPage(engine, page);
        if(!validateResult.result){
            return new DoorEntity<{}>(false, validateResult.message);
        }
        return new DoorEntity<{}>(true, "验证码发送成功");
    }


    async sendValidateCodeByPage(engine : MbEngine<{}>, page : Page){
        try{
            engine.resetMonitor();
            await page.waitForTimeout(5000);
            const monitor = new MdSendValidateCodeMonitor();
            const result = await engine.openWaitMonitor(page, undefined, monitor, {}, fillValidateCode);
            log.info("sendValidateCode result is ", result);
            if(!result.getCode()){
                return {
                    result : false,
                    message : result.getData()
                };
            }
            return {
                result : true,
                message : result.getData()
            };
        }catch(error){
            log.error("sendValidateCode error", error);
            return {
                result : false,
                message : "验证码发生未知异常"
            };
        }
    }

    async awaitByLoginResult(header : {[key : string] : any}, engine : MbEngine<{}>, page : Page){
        engine.saveContextState();
        setTimeout(async () => {
            try{
                const monitor = new MdLoginMonitor();
                let loginResult = false;
                monitor.setHandler(async (request, response) => {
                    const header = await request?.allHeaders();
                    log.info("login monitor request ", header);
                    if(header){
                        engine.saveContextState();
                    }
                    loginResult = true;
                    return { "loginResult": true };
                });
            engine.resetMonitor();
            engine.resetListener(page);
            const result = await engine.openWaitMonitor(page, "https://myseller.taobao.com/home.htm/QnworkbenchHome", monitor, {});
            if(!result.getCode()){
                return new DoorEntity<{}>(false, "登录失败");
            }
            return new DoorEntity<{}>(true, "登录成功");
        }catch(error){
            log.error("awaitByLoginResult error", error);
            return new DoorEntity<{}>(true, "登录成功");
        }}, 1000);
        return new DoorEntity<{}>(true, "登录成功");

    }

    @InvokeType(Protocols.INVOKE)
    async loginByValidateCode(resourceId: number, validateCode: string) {
        const engine = await getLoginEngine(resourceId);
        if(!engine){
            return;
        }
        const page = engine.getPage();
        if(!page){
            return;
        }
        let frame = await getFrame(page, "identity_verify.htm");
        if(!frame){
            log.error("sendValidateCode frame is null");
            return;
        }
        const responsePromise = page.waitForResponse(response =>
            response.request().url().includes("identity_verify.htm"),
            { timeout: 10000 }
        );
        await frame.locator("#J_Checkcode").first().fill(validateCode);
        log.info("loginByValidateCode fill validateCode");
        await frame.locator("#btn-submit").first().click();
        log.info("loginByValidateCode click submit start");
        const response = await responsePromise;
        const header = await response?.allHeaders();
        await page.waitForTimeout(3000);
        frame = await getFrame(page, "identity_verify.htm");
        if(!frame){
            log.warn("loginByValidateCode frame is null");
            return await this.awaitByLoginResult(header, engine, page);
        }
        log.info("loginByValidateCode click submit end");
        const errorText = await frame.evaluate(() => {
            //@ts-ignore
            const errorText = document.querySelector(".ui-tiptext.ui-tiptext-error");
            if(errorText){
                return errorText.textContent;
            }
            return null;
        });
        log.info("loginByValidateCode errorText is ", errorText);
        if(errorText){
            return new DoorEntity<{}>(false, errorText);
        }
        await page.waitForTimeout(3000);
        return await this.awaitByLoginResult(header, engine, page);
    }

    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number) {
        const url = "https://myseller.taobao.com/home.htm/QnworkbenchHome/";
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
                const header = await request?.allHeaders();
                log.info("login monitor request ", header);
                if(header){
                    engine.saveContextState();
                }
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
                this.send("onMonitorLoginResult", resourceId, false); // 发送登录结果
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

