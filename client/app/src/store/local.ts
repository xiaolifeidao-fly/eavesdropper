const Store = require("electron-store");
const store = new Store();


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