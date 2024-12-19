import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class MbShopApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    async findMbShopInfo(resourceId : number) {
        return await this.invokeApi("findMbShopInfo", resourceId);
    }

}