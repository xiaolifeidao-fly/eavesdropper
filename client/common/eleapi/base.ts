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
    return "";
  }

  getEvent(){
    return this.event
  }

  setEvent(event: any){
    this.event = event
  }

  abstract getApiName(): string;
  

  jsonToObject(clazz: any, data: {}){
    return plainToInstance(clazz, data)
  }

  send(key : string, ...args: any): void{
    let namespace = this.getNamespace();
    let rendererApiName = namespace + "_" + this.getApiName();
    const channel = `${rendererApiName}.${key}`;
    this.sendMessage(channel, ...args)
  }

  sendMessage(channel: string, ...args: any): void{
    this.getEvent().sender.send(channel, ...args);
  }

  async invokeApi(functionName : string, ...args : any){
      const env = this.getEnvironment();
      if(env == 'Electron'){
          let apiName = this.getApiName();
          if(this.getNamespace()){
              apiName = this.getNamespace() + "_" + apiName;
          }
          //@ts-ignore
          return await window[this.getApiName()][functionName](...args);
      }
      return {};
  }

  async onMessage(functionName : string, callback : (...args: any) => void, topic : string|undefined = undefined){
    if(topic == undefined){
      topic = functionName;
    }
    const env = this.getEnvironment();
    if(env == 'Electron'){
        let apiName = this.getApiName();
        if(this.getNamespace()){
            apiName = this.getNamespace() + "_" + apiName;
        }
        if(topic){
          if(topic in this.consumers){
            return {};
          }
          this.consumers[topic] = apiName;
        }
        //@ts-ignore
        return await window[this.getApiName()][functionName](callback);
    }
    return {};
  }
    
}

export {
  ElectronApi
}
