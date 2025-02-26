
import { PxxMonitorRequest } from "../pxx.monitor";

export class PxxLoginMonitor extends PxxMonitorRequest<{}>{
    hasLogin : boolean = false;

    isLogin(headers: { [key: string]: string; }): boolean{
        const cookies = headers['cookie'];
        if(!cookies){
            return false;
        }
        const validateCookieKeys= ["pdd_user_uin"];
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