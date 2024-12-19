import { StoreApi } from "@eleapi/store/store";
import { InvokeType, Protocols } from "@eleapi/base";
import { get, set, remove, clear } from "@utils/store/electron";

export class StoreApiImpl extends StoreApi {

    @InvokeType(Protocols.INVOKE)
    async getItem(key : string){
        return get(key)
    }

    @InvokeType(Protocols.INVOKE)
    async setItem(key : string, value : any){
        set(key, value)
    }

    @InvokeType(Protocols.INVOKE)
    async removeItem(key : string){
        remove(key);
    }

    @InvokeType(Protocols.INVOKE)
    async clear(){
        clear();
    }

}