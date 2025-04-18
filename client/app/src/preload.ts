
// require('module-alias/register');
const { contextBridge, ipcRenderer } = require('electron');
import log from 'electron-log';
import { ElectronApi, Protocols } from '@eleapi/base';
import { registerApi } from '@eleapi/register';
import 'reflect-metadata';

 // 定义一个类型，将暴露给渲染进程的 API 类型化
type ExposedApi = {
  [K in keyof ElectronApi]: ElectronApi[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : never;
};

function exposeByPrototype(apiName: string, prototype : any, exposedConfig : ExposedApi){
  Object.getOwnPropertyNames(prototype)
    .filter((key) => key !== 'constructor') // 排除构造函数
    .forEach((methodName) => {
      const method = (prototype as any)[methodName];
      const metadata = Reflect.getMetadata('invokeType', prototype, methodName);

      if (typeof method === 'function') {
        // 使用 ipcRenderer.invoke 封装方法
        if(metadata == undefined || metadata == Protocols.INVOKE){
            (exposedConfig as any)[methodName] = (...args: any) => {
              if(methodName == "removeOnMessage"){
                const removeKey = `${args[0]}.${args[1]}`;
                ipcRenderer.removeAllListeners(removeKey);
                return;

              }
              return ipcRenderer.invoke(`${apiName}.${methodName}`, ...args);
            };
        }else{
            console.log("exposeApi trigger ", apiName);
            (exposedConfig as any)[methodName] = (callback: (...args: any) => void) => {
              ipcRenderer.on(`${apiName}.${methodName}`, (event : any, ...args: any) => {
                  callback(...args); // 将参数传递给回调函数
              });
            };
        }
      }
    });
}

function exposeApi(apiName: string, cls: { new(...args: any[]): ElectronApi }) {
  const exposedConfig = {} as ExposedApi;
  const prototype = cls.prototype; // 通过类获取原型
  const parentPrototype = Object.getPrototypeOf(prototype); // 获取父类的原型

  exposeByPrototype(apiName, prototype, exposedConfig);

  exposeByPrototype(apiName, parentPrototype, exposedConfig);

  return exposedConfig;
}

async function registerRenderApi(cls: { new(...args: any[]): ElectronApi }){
  const registerInstance = new cls();
  const apiName = registerInstance.getApiName();
  const namespace = registerInstance.getNamespace();
  let rendererApiName = apiName;
  if(namespace){
    rendererApiName = namespace + "_" + apiName;
  }
  const exposedConfig = exposeApi(rendererApiName, cls)
  contextBridge.exposeInMainWorld(apiName, (exposedConfig as ExposedApi));
}

try{
    const registerApis = registerApi();
    registerApis.forEach(cls => {
      registerRenderApi(cls);
    });
}catch(e){
  log.error(e)
}
