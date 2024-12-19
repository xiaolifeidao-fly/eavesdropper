
let store :any = undefined;

function initStore(){
    try{
        const Store = require("electron-store");
        store = new Store();
    }catch(e){
        //ignore
    }
}
initStore();

export function get(key : string){
    return store.get(key);
}

export function set(key : string, value : any){
    store.set(key, value);
}

export function remove(key : string){
    store.delete(key);
}

export function clear(){
    store.clear();
}


