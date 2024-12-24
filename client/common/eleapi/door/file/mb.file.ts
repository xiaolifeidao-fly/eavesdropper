import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbFileApi extends ElectronApi {
    
    getApiName(): string {
        return "MbFileApi";
    }

    @InvokeType(Protocols.INVOKE)
    async upload(resourceId : number, paths: string[]) {
        return await this.invokeApi("upload", resourceId, paths);
    }
}