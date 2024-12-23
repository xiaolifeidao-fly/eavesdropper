import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbShopApi extends ElectronApi {

    getApiName(): string {
        return "MbShopApi";
    }

    @InvokeType(Protocols.INVOKE)
    async findMbShopInfo(resourceId : number) {
        return await this.invokeApi("findMbShopInfo", resourceId);
    }

}
