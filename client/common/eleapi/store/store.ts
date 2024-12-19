import { ElectronApi, InvokeType, Protocols } from "@eleapi/base";
import { get, set, remove, clear } from "@utils/store/electron";

export class StoreApi extends ElectronApi {
    
    getApiName(): string {
        return "StoreApi";
    }

    isElectron(){
        try{
            //@ts-ignore
            if(window == undefined){
                return true;
            }
            return false;
        }catch(e){
            return true;
        }
    }


    async invokeApi(functionName: string, ...args: any): Promise<any> {
        const env = this.getEnvironment();
        if(env == 'Electron'){
            //@ts-ignore
            return await window[this.getApiName()][functionName](...args);
        }
        //@ts-ignore
        return localStorage[functionName](...args);
    }

    @InvokeType(Protocols.INVOKE)
    async getItem(key : string){
        if(this.isElectron()){
            return await get(key);
        }
        return await this.invokeApi("getItem", key);
    }

    @InvokeType(Protocols.INVOKE)
    async setItem(key : string, value : any){
        if(this.isElectron()){
            set(key, value);
            return;
        }
        return await this.invokeApi("setItem", key, value);
    }

    @InvokeType(Protocols.INVOKE)
    async removeItem(key : string){
        if(this.isElectron()){
            remove(key);
            return;
        }
        return await this.invokeApi("removeItem", key);
    }

    @InvokeType(Protocols.INVOKE)
    async clear(){
        if(this.isElectron()){
            clear();
            return;
        }
        return await this.invokeApi("clear");
    }

}