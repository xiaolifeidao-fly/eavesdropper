import { ElectronApi } from "@eleapi/base";
import { StoreApiImpl } from "@src/impl/store/store";
import { MbLoginApiImpl } from "@src/impl/door/login/mb.login";
import { MbShopApiImpl } from "@src/impl/door/shop/mb.shop";
import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { MbUserApiImpl } from "./door/user/user";
import { MbFileApiImpl } from "./door/file/mb.file";
import { MonitorPddSku } from "@src/impl/door/pxx/pxx.sku";
import { TaskApiImpl } from "@src/impl/door/task/task";
import { InstallerImpl } from "@src/impl/installer/installer.impl";
import { MonitorPxxLogin } from "./door/pxx/pxx.login";

import { InstallerExtImpl } from "./installer/installer.ext";
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
    register.push(TaskApiImpl);
    register.push(InstallerImpl);
    register.push(MonitorPxxLogin);
    register.push(InstallerExtImpl);
    return register;
}


