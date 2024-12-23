import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbFileApi extends ElectronApi {
    
    getApiName(): string {
        return "MbFileApi";
    }

    @InvokeType(Protocols.INVOKE)
    async upload(paths: string[]) {
        return await this.invokeApi("upload", paths);
    }
}