
import { InvokeType, Protocols } from "@eleapi/base";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { DoorEngine, getPlatform, setPlatform } from "@src/door/engine";
import { DoorEntity } from "@src/door/entity";
import { MbEngine } from "@src/door/mb/mb.engine";
import { MdLoginMonitor } from "@src/door/monitor/mb/login/md.login.monitor";
import { get } from "@utils/store/electron";
import { app } from "electron";
import log from "electron-log";
import path from "path";
import { Frame, Page } from "playwright-core";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";

const loginEngineMap : { [key: string]: DoorEngine; } = {};

async function getLoginEngine(resourceId : number){
    if(!loginEngineMap[resourceId]){
        const engine = new MbEngine<{}>(resourceId);
        await engine.init("");
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

export class MbLoginApiImpl extends MbLoginApi {


    async getFrame(page: Page, frameName: string) {
        const frame = await page.mainFrame();
        for (const child of frame.childFrames()) {
            if (child.url().includes(frameName)) {
                return child;
            }
        }
        return undefined;
    }

    @InvokeType(Protocols.INVOKE)
    async inputLoginInfo(resourceId: number, username: string, password: string) {
        try{
            const engine = await getLoginEngine(resourceId);
            if(!engine){
                log.error("inputLoginInfo engine is null");
                return;
            }
            const page = engine.getPage();
            if(!page){
                log.error("inputLoginInfo page is null");
                return;
            }
            await page.goto("https://myseller.taobao.com/home.htm/QnworkbenchHome/");
            await page.waitForTimeout(2000);
            log.info("inputLoginInfo username is ", username);
            log.info("inputLoginInfo password is ", password);
            const frame = await this.getFrame(page, "mini_login.htm");
            if(!frame){
                log.error("inputLoginInfo frame is null");
                return;
            }
            await frame.locator("#fm-login-id").first().fill(username);
            await frame.locator("#fm-login-password").first().fill(password);
            log.info("inputLoginInfo fill username and password");
            const responsePromise = page.waitForResponse(response =>
                response.request().url().includes("newlogin/login.do"),
                { timeout: 10000 }
            );
            await frame.locator(".fm-button.fm-submit.password-login ").first().click();
            const result = await responsePromise;
            const json = await result.json();
            log.info("inputLoginInfo click login result is ", json);
            const loginResult = json.content?.data?.loginResult;
            if(loginResult && loginResult == "success"){
                log.info("inputLoginInfo login success wait monitor");
                await this.awaitByLoginResult(engine, page);
                return new DoorEntity<{}>(true, "登录成功");
            }
            const titleMsg = json.content?.data?.titleMsg;
            const iframeRedirect = json.content?.data?.iframeRedirect;
            if(!iframeRedirect){
                return new DoorEntity<{}>(false, titleMsg);
            }
            const validateResult = await this.sendValidateCode(page);
            if(!validateResult.result){
                return new DoorEntity<{}>(false, validateResult.message);
            }
            return new DoorEntity<{}>(undefined,"请输入验证码");
        }catch(error : any){
            log.error("inputLoginInfo error", error);
            return new DoorEntity<{}>(false, "登录失败");
        }
    }

    async sendValidateCode(page : Page){
        try{
            await page.waitForLoadState('load');
            await page.waitForTimeout(5000);
            const frame = await this.getFrame(page, "identity_verify.htm");
            if(!frame){
                log.error("sendValidateCode frame is null");
                return {
                    result : false,
                    message : "打开验证码界面失败"
                };
            }
            const responsePromise = page.waitForResponse(response =>
                response.request().url().includes("phone/send_code.do"),
                { timeout: 10000 }
            );
            await frame.locator("#J_GetCode").first().click();
            log.info("sendValidateCode click validate code ");
            const response = await responsePromise;
            const json = await response.json();
            /**
             * {"content":{"code":0,"codeMsg":"success","value":"验证码发送成功","success":true},"hasError":false}
             */
            const code = json.content?.code;
            const value = json.content?.value;
            if(code != 0){
                return {
                    result : false,
                    message : value
                };
            }
            log.info("sendValidateCode success ", json);
            return {
                result : true,
                message : value
            };
        }catch(error){
            log.error("sendValidateCode error", error);
            return {
                result : false,
                message : "验证码发生未知异常"
            };
        }
    }

    async awaitByLoginResult(engine : MbEngine<{}>, page : Page){
        const loginResponse = page.waitForResponse(response =>
            response.request().url().includes("home.htm/QnworkbenchHome"),
            { timeout: 10000 }
        );
        const headers = await (await loginResponse).allHeaders();
        log.info("awaitByLoginResult login headers is ", headers);
        engine.saveContextState();
        return true;
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
        let frame = await this.getFrame(page, "identity_verify.htm");
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
        await responsePromise;
        frame = await this.getFrame(page, "identity_verify.htm");
        if(!frame){
            log.warn("loginByValidateCode frame is null");
            return await this.awaitByLoginResult(engine, page);
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
        return await this.awaitByLoginResult(engine, page);
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

