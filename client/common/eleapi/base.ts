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

  getApiName(): string{
    const namespace = this.getNamespace();
    if(namespace){
       return namespace + "_" +this.constructor.name;
    }
    return this.constructor.name;
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

