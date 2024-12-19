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

  event : any;

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

  getEvent(){
    return this.event
  }

  setEvent(event: any){
    this.event = event
  }

  getApiNameSuffix(): string{
    return "Impl";
  }

  getApiName(): string{
    const namespace = this.getNamespace();
    let constructorName = this.constructor.name;
    if(!constructorName.endsWith(this.getApiNameSuffix())){
       constructorName = constructorName + this.getApiNameSuffix();
    }
    if(namespace){
       return namespace + "_" +constructorName;
    }
    return constructorName;
  }

  jsonToObject(clazz: any, data: {}){
    return plainToInstance(clazz, data)
  }

  send(key : string, ...args: any[]): void{
    const channel = `${this.getApiName()}.${key}`;
    this.sendMessage(channel, ...args)
  }

  sendMessage(channel: string, ...args: any[]): void{
    this.getEvent().sender.send(channel, args);
  }

  async invokeApi(functionName : string, ...args : any){
      const env = this.getEnvironment();
      if(env == 'Electron'){
          //@ts-ignore
          return await window[this.getApiName()][functionName](...args);
      }
      return {};
  }
    
}

export {
  ElectronApi
}
