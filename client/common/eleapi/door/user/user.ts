import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbUserApi extends ElectronApi {
    
    getApiName(): string {
        return "MbUserApi";
    }

    @InvokeType(Protocols.INVOKE)
    async getUserInfo(resourceId : number) {
        return await this.invokeApi("getUserInfo", resourceId);
    }

    @InvokeType(Protocols.INVOKE)
    async openUserInfo(resourceId : number) {
        return await this.invokeApi("openUserInfo", resourceId);
    }

}
