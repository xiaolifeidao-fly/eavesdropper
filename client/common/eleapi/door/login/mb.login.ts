import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbLoginApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    async login(url: string) {
        return await this.invokeApi("login", url);
    }
}