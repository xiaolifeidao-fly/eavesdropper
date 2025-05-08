import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class PxxLoginApi extends ElectronApi {
    
    getApiName(): string {
        return "PxxLoginApi";
    }

    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number) {
        return await this.invokeApi("login", resourceId);
    }

}