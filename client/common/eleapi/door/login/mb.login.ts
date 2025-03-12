import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbLoginApi extends ElectronApi {
    
    getApiName(): string {
        return "MbLoginApi";
    }

    @InvokeType(Protocols.INVOKE)
    async inputLoginInfo(resourceId: number, username: string, password: string) {
        return await this.invokeApi("inputLoginInfo", resourceId, username, password);
    }

    @InvokeType(Protocols.INVOKE)
    async sendValidateCode(resourceId: number) {
        return await this.invokeApi("sendValidateCode", resourceId);
    }

    @InvokeType(Protocols.INVOKE)
    async loginByValidateCode(resourceId: number, validateCode: string) {
        return await this.invokeApi("loginByValidateCode", resourceId, validateCode);
    }

    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number) {
        return await this.invokeApi("login", resourceId);
    }

    @InvokeType(Protocols.TRRIGER)
    async onMonitorLoginResult(callback : (resourceId : number, result : boolean) => void){
        return await this.onMessage("onMonitorLoginResult", callback);
    }

}