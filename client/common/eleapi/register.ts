import { ElectronApi } from "@eleapi/base";
import { MbFileApi } from "@eleapi/door/file/mb.file";
import { MbLoginApi } from "@eleapi/door/login/mb.login";
import { MbShopApi } from "@eleapi/door/shop/mb.shop";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";
import { MbUserApi } from "@eleapi/door/user/user";
import { StoreApi } from "@eleapi/store/store";
import { MonitorPxxSkuApi } from "@eleapi/door/sku/pxx.sku";
import { TaskApi } from "@eleapi/door/task/task";
import { InstallerApi } from "@eleapi/installer.api";
const register : { new(...args: any[]): ElectronApi }[] = []

export function registerApi(){
    register.push(MbSkuApi);
    register.push(MbShopApi);
    register.push(MbLoginApi);
    register.push(StoreApi);
    register.push(MbUserApi);
    register.push(MbFileApi);
    register.push(MonitorPxxSkuApi);
    register.push(TaskApi);
    register.push(InstallerApi);
    return register;
}