import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";

export class SearchSkuApi extends ElectronApi{

    getApiName(): string {
        return "SearchSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async searchSku(publishResourceId : number, title : string){
        return await this.invokeApi("searchSku", publishResourceId, title);
    }
}