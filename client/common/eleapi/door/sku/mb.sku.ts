import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbSkuApi extends ElectronApi {

    getApiName(): string {
        return "MbSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(url : string) {
        return await this.invokeApi("findMbSkuInfo", url);
    }

}
