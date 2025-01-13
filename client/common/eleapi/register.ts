import { ElectronApi } from "@eleapi/base";
import { MbFileApi } from "@eleapi/door/file/mb.file";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { MbShopApi } from "@eleapi/door/shop/mb.shop";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";
import { MbUserApi } from "@eleapi/door/user/user";
import { StoreApi } from "@eleapi/store/store";
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