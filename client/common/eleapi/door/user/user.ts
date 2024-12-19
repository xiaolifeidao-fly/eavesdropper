import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbUserApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    async getUserInfo(resourceId : number) {
        return await this.invokeApi("getUserInfo", resourceId);
    }

}
