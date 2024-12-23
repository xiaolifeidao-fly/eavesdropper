require('module-alias/register');
import { DoorEntity } from "@src/door/entity";
import { MbEngine } from "@src/door/mb/mb.engine";
import { Page, Response, Request } from "playwright";
import { Monitor } from "@src/door/monitor/monitor";
import { MbMonitorRequest } from "@src/door/monitor/mb/mb.monitor";
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


