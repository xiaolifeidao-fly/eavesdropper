import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbLoginApi extends ElectronApi {
    
    getApiName(): string {
        return "MbLoginApi";
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