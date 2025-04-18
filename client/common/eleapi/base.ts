// require('module-alias/register');
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';

export const Protocols = {
  INVOKE : 'INVOKE',
  TRRIGER : 'TRRIGER'
}


export function InvokeType(invokeType : string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata('invokeType', invokeType, target, propertyKey);
  };
}


abstract class ElectronApi {

  apiName: string;

  windows : any;

  consumers : {
    [key: string]: string
  } = {};


  constructor() {
    this.apiName = this.getApiName()
  }

  getEnvironment(): string {
    try{
      // @ts-ignore
      if(navigator == undefined){
         return 'Electron';
      }
      // @ts-ignore
      const userAgent = navigator.userAgent  
      if (userAgent.includes("Electron")) {
        return 'Electron';
      }
      return 'Browser';
    }catch(e){
      return 'Electron';
    }
  }
  
  getNamespace(): any {
    return undefined;
  }

  getWindows(){
    return this.windows
  }

  setWindows(windows: any){
    this.windows = windows
  }

  abstract getApiName(): string;
  

  jsonToObject(clazz: any, data: {}){
    return plainToInstance(clazz, data)
  }

  send(key : string, ...args: any): void{
    const channel = this.buildKey(key);
    this.sendMessage(channel, ...args)
  }

  buildKey(key : string){
    let namespace = this.getNamespace();
    let rendererApiName = this.getApiName();
    if(namespace){
      rendererApiName = namespace + "_" + rendererApiName;
    }
    return `${rendererApiName}.${key}`;
  }

  sendMessage(channel: string, ...args: any): void{
    this.getWindows().webContents.send(channel, ...args);
  }

  async invokeApi(functionName : string, ...args : any){
      const env = this.getEnvironment();
      if(env == 'Electron'){
          let apiName = this.getApiName();
          if(this.getNamespace()){
              apiName = this.getNamespace() + "_" + apiName;
          }
          //@ts-ignore
          // console.log(window[this.getApiName()])
          //@ts-ignore
          return await window[this.getApiName()][functionName](...args);
      }
      return {};
  }

  @InvokeType(Protocols.INVOKE)
  async removeOnMessage(apiName : string, functionName : string){ 
    try{  
      return await this.invokeApi("removeOnMessage", apiName, functionName);
    }catch(e : any){
        
    }
  }

  async onMessage(functionName : string, callback : (...args: any) => void, topic : string|undefined = undefined){
    const env = this.getEnvironment();
    if(env == 'Electron'){
        let apiName = this.getApiName();
        if(this.getNamespace() != undefined){
            apiName = this.getNamespace() + "_" + apiName;
        }
        await this.removeOnMessage(apiName, functionName);
        //@ts-ignore
        return await window[apiName][functionName](callback);
    }
    return {};
  }

}

export {
  ElectronApi
}
