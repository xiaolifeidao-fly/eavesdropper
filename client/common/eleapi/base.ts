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

  send(key : string, ...args: any[]): void{
    const channel = `${this.getApiName()}.${key}`;
    this.sendMessage(channel, ...args)
  }

  sendMessage(channel: string, ...args: any[]): void{
    this.getEvent().sender.send(channel, args);
  }
    
}

export {
  ElectronApi
}

