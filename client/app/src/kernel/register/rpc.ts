require('module-alias/register');
import { ElectronApi, Protocols } from "@eleapi/base";
import { TestApiImpl } from "@src/impl/test/test";
import { ipcMain } from "electron";
import log from "electron-log";

function registerMethodsFromClass(cls: { new(...args: any[]): ElectronApi }) {
    const prototype = cls.prototype; // 通过类获取原型
  
    Object.getOwnPropertyNames(prototype)
        .filter((key) => key !== 'constructor')
        .forEach((methodName) => {
            const method = (prototype as any)[methodName]; // 获取实例方法
            // 使用单例实例调用方法
            const registerInstance = new cls();
            const metadata = Reflect.getMetadata('invokeType', prototype, methodName);
            if(metadata == Protocols.INVOKE){
                log.info("metadata impl", metadata, `${registerInstance.getApiName()}.${methodName}`);
                ipcMain.handle(`${registerInstance.getApiName()}.${methodName}`, async (event, ...args) => {
                    const instance = new cls();
                    instance.setEvent(event);
                    return method.apply(instance, args);
                });
            }
        });
}

export function registerRpc(){

  registerMethodsFromClass(TestApiImpl)
}
