import { initStore } from "@utils/store/electron";


export function init(){
    const Store = require("electron-store");
    const store = new Store();
    initStore(store);
}


