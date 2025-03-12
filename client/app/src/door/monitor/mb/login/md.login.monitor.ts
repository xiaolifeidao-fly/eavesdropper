import { DoorEntity } from "@src/door/entity";
import { MbEngine } from "@src/door/mb/mb.engine";
import { Page, Response, Request } from "playwright";
import { Monitor } from "@src/door/monitor/monitor";
import { MbMonitorRequest, MbMonitorResponse } from "@src/door/monitor/mb/mb.monitor";
import log from "electron-log";


export class MdLoginMonitor extends MbMonitorRequest<{}>{

    hasLogin : boolean = false;

    isLogin(headers: { [key: string]: string; }): boolean{
        const cookies = headers['cookie'];
        if(!cookies){
            return false;
        }
        const validateCookieKeys= ["cookie2","cookie3_bak","cookie1","login","uc1","wk_cookie2","sgcookie"];
        const cookieKeys = [];
        const cookieArray = cookies.split(";")
        for(let cookieData of cookieArray){
            const cookie = cookieData.split("=");
            if(cookie == undefined || cookie.length ==1){
                continue;
            }
            cookieKeys.push(cookie[0].trim());
        }
        let validateResult = true;
        for(let key of validateCookieKeys){
            if(!cookieKeys.includes(key)){
                validateResult = false;
            }
        }
        return validateResult;
    }

    getKey(): string{
        return "loginData";
    }
    
    async isMatch(url: string, method: string, headers: {[key: string]: string;}): Promise<boolean>{
        if(this.hasLogin){
            return false;
        }
        if(this.isLogin(headers)){
            return true;
        }
        return false; 
    }


}

export class MdInputLoginInfoMonitor extends MbMonitorResponse<{}>{
    getApiName(): string | string[] {
        return ["newlogin/login.do"];
    }


    getKey(): string{
        return "inputLogin";
    }

    async getResponseData(response: Response): Promise<DoorEntity<{}>>{
        const json : any = await response.json();
        log.info("inputLoginInfo click login result is ", json);
        if ('ret' in json){
            const doorEntity = await this.buildDoorEntity(json);
            if(doorEntity){
                return doorEntity;
            }
        }
        const result = {
            "result" : "1",
            "message" : ""
        }
        const loginResult = json.content?.data?.loginResult;
        if(loginResult && loginResult == "success"){
            result.result = "1";
            result.message = "登录成功";
            return new DoorEntity<{}>(true, result);
        }
        const titleMsg = json.content?.data?.titleMsg;
        const iframeRedirect = json.content?.data?.iframeRedirect;
        if(iframeRedirect != undefined){
            result.result = "2";
            result.message = "请填写验证码";
        }else{
            result.message = titleMsg;
            result.result = "0";
        }
        return new DoorEntity<{}>(true, result);
    }

}

export class MdSendValidateCodeMonitor extends MbMonitorResponse<{}>{

    getApiName(): string | string[] {
        return ["phone/send_code.do"];
    }


    getKey(): string{
        return "sendValidateCode";
    }

    async getResponseData(response: Response): Promise<DoorEntity<{}>> {
        const json = await response.json();
        log.info("sendValidateCode result is ", json);
        /**
         * {"content":{"code":0,"codeMsg":"success","value":"验证码发送成功","success":true},"hasError":false}
         */
        if ('ret' in json){
            const doorEntity = await this.buildDoorEntity(json);
            if(doorEntity){
                return doorEntity;
            }
        }
        const code = json.content?.code;
        const value = json.content?.value;
        if(code != 0){
            return new DoorEntity<{}>(false, value);
        }
        log.info("sendValidateCode success ", json);
        return new DoorEntity<{}>(true, "验证码发送成功");
    }
}