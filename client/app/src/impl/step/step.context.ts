import { get, remove, set } from "@utils/store/electron";


export class StepContext {

    private cache : { [key : string] : any} = {};

    private storeKey : string = "step_context"; 

    constructor(key : string, resourceId : number, groupCode : string){
        this.storeKey = `step_context_${key}_${resourceId}_${groupCode}`;
    }

    public putItem(key : string, value : any, store : boolean = true){
        const storeKey = this.getStoreKey(key);
        this.cache[storeKey] = value;
        if(store){
            set(storeKey, value);
        }
    }

    public getStoreKey(key : string) : string{
        return `${this.storeKey}_${key}`;
    }

    public getItem(key : string) : any{
        const storeKey = this.getStoreKey(key);
        const value = this.cache[storeKey];
        if(value){
            return value;
        }
        const item = get(storeKey);
        if(item){
            this.cache[storeKey] = item;
            return item;
        }
        return null;
    }

    public release(){
        Object.keys(this.cache).forEach(key => {
            remove(key);
            delete this.cache[key];
        });
        this.cache = {};
    }
}