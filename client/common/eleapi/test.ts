import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";


export class TestApi extends ElectronApi {

    @InvokeType(Protocols.INVOKE)
    test(text: string, num: number) {
        //@ts-ignore
        return window[this.getApiName()].test(text, num)
    }

    @InvokeType(Protocols.TRRIGER)
    onTest(callback: (data: string) => void) {
        //@ts-ignore
        window[this.getApiName()].onTest(async (data:string)=>{
            callback(data);
        });
    }


}