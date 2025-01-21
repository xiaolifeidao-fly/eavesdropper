import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbLoginApi extends ElectronApi {
    
    getApiName(): string {
        return "MbLoginApi";
    }

    @InvokeType(Protocols.INVOKE)
    async login(resourceId: number, url: string) {
        return await this.invokeApi("login", resourceId, url);
    }
}