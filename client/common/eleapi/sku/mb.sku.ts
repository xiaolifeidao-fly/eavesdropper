import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class SkuApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(url : string) {
        //@ts-ignore
        return window[this.getApiName()].findMbSkuInfo(url)
    }

}