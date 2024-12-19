import { StoreApi } from "@eleapi/store/store";

const store = new StoreApi();

export async function getItem(key : string){
    return await store.getItem(key);
}

export async function setItem(key : string, value : any){
    return await store.setItem(key, value);
}

export async function removeItem(key : string){
    return await store.removeItem(key);
}

export async function clear(){
    return await store.clear();
}