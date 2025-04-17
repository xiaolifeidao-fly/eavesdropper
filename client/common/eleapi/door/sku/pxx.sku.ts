import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { DoorSkuDTO } from "@model/door/sku";

export class MonitorPxxSkuApi extends ElectronApi{

    getApiName(): string {
        return "MonitorPxxSkuApi";
    }

    @InvokeType(Protocols.INVOKE)
    async monitorSku(){
        return await this.invokeApi("monitorSku");
    }

    @InvokeType(Protocols.TRRIGER)
    async onGatherSkuMessage(callback: (doorSkuDTO: DoorSkuDTO) => void) {
      return await this.onMessage('onGatherSkuMessage', callback)
    }
}
