import { ElectronApi } from "./base";
import { MbFileApi } from "./door/file/mb.file";
import { MbLoginApi } from "./door/login/mb.login";
import { MbShopApi } from "./door/shop/mb.shop";
import { MbSkuApi } from "./door/sku/mb.sku";
import { MbUserApi } from "./door/user/user";
import { StoreApi } from "./store/store";
import { v4 as uuidv4 } from 'uuid';

const register : { new(...args: any[]): ElectronApi }[] = []

export function registerApi(){
    register.push(MbSkuApi);
    register.push(MbShopApi);
    register.push(MbLoginApi);
    register.push(StoreApi);
    register.push(MbUserApi);
    register.push(MbFileApi);
    return register;
}