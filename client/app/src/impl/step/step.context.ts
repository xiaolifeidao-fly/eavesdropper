import { get, remove, set } from "@utils/store/electron";


export class StepContext {

    private cache : { [key : string] : any} = {};

    public putItem(key : string, value : any){
        this.cache[key] = value;
        set(key, value);
    }

    public getItem(key : string) : any{
        const value = this.cache[key];
        if(value){
            return value;
        }
        const item = get(key);
        if(item){
            this.cache[key] = item;
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