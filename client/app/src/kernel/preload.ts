
const { contextBridge, ipcRenderer } = require('electron');
require('module-alias/register');
import log from 'electron-log';
import { ElectronApi, Protocols } from '@eleapi/base';
import { TestApi } from '@eleapi/test';
 // 定义一个类型，将暴露给渲染进程的 API 类型化
type ExposedApi = {
  [K in keyof ElectronApi]: ElectronApi[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : never;
};





function exposeApi(apiName: string, cls: { new(...args: any[]): ElectronApi }) {
  const exposedConfig = {} as ExposedApi;
  const prototype = cls.prototype; // 通过类获取原型
  Object.getOwnPropertyNames(prototype)
    .filter((key) => key !== 'constructor') // 排除构造函数
    .forEach((methodName) => {
      const method = (prototype as any)[methodName];
      if (typeof method === 'function') {
        // 使用 ipcRenderer.invoke 封装方法
        const metadata = Reflect.getMetadata('invokeType', prototype, methodName);
        if(metadata == undefined || metadata == Protocols.INVOKE){
            (exposedConfig as any)[methodName] = (...args: any[]) => {
              return ipcRenderer.invoke(`${apiName}.${methodName}`, ...args);
            };
        }else{
            (exposedConfig as any)[methodName] = (callback: (...args: any[]) => void) => {
              ipcRenderer.on(`${apiName}.${methodName}`, (event, ...args: any[]) => {
                  callback(args); // 将参数传递给回调函数
              });
            };
        }
      }
    });

  return exposedConfig;
}

function registerApi(cls: { new(...args: any[]): ElectronApi }){
  const registerInstance = new cls();
  const apiName = registerInstance.getApiName();
  const exposedConfig = exposeApi(apiName, cls)
  contextBridge.exposeInMainWorld(apiName, (exposedConfig as ExposedApi));
}

try{
  registerApi(TestApi)
}catch(e){
  log.error(e)
}


