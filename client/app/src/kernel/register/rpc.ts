require('module-alias/register');
import { ElectronApi, Protocols } from "@eleapi/base";
import { uploadFile } from "@src/door/mb/file/file";
import { registerApi } from "@src/impl/register";
import { ipcMain } from "electron";
import log from "electron-log";

 function registerMethodsFromClass(cls: { new(...args: any[]): ElectronApi }) {
    const prototype = cls.prototype; // 通过类获取原型
  
    Object.getOwnPropertyNames(prototype)
        .filter((key) => key !== 'constructor')
        .forEach(async (methodName) => {
            const method = (prototype as any)[methodName]; // 获取实例方法
            // 使用单例实例调用方法
            const registerInstance = new cls();
            const metadata = Reflect.getMetadata('invokeType', prototype, methodName);
            if(metadata == Protocols.INVOKE){
                const namespace = registerInstance.getNamespace();
                const apiName = registerInstance.getApiName();
                let rendererApiName = namespace + "_" + apiName;
                log.info("metadata impl", metadata, `${rendererApiName}.${methodName}`);
                ipcMain.handle(`${rendererApiName}.${methodName}`, async (event, ...args) => {
                    const instance = new cls();
                    instance.setEvent(event);
                    return method.apply(instance, args);
                });
            }
        });
}




export async function registerRpc(){
    const register = registerApi();
    register.forEach(cls => {
        registerMethodsFromClass(cls);
    });
}


