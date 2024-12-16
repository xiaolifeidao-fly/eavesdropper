import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class ShopApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    async findMbShopInfo(url : string) {
        //@ts-ignore
        return window[this.getApiName()].findMbShopInfo(url)
    }

}