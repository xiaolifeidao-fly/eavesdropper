import { ElectronApi } from "@eleapi/base";
import { StoreApiImpl } from "@src/impl/store/store";
import { MbLoginApiImpl } from "@src/impl/door/login/mb.login";
import { MbShopApiImpl } from "@src/impl/door/shop/mb.shop";
import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { MbUserApiImpl } from "./door/user/user";
import { MbFileApiImpl } from "./door/file/mb.file";
import { MonitorPddSku } from "@src/impl/door/pxx/pxx.sku";
const register : { new(...args: any[]): ElectronApi }[] = [
]

export function registerApi(){
    register.push(StoreApiImpl);
    register.push(MbSkuApiImpl);
    register.push(MbShopApiImpl);
    register.push(MbLoginApiImpl);
    register.push(MbUserApiImpl);
    register.push(MbFileApiImpl);
    register.push(MonitorPddSku);
    return register;
}


