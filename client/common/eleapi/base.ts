import 'reflect-metadata';

export const Protocols = {
  INVOKE : 'INVOKE',
  TRRIGER : 'TRRIGER'
}


export function InvokeType(invokeType : string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // 使用 Reflect 存储装饰器的属性（description）
      Reflect.defineMetadata('invokeType', invokeType, target, propertyKey);
  };
}

// export function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
//   // 保存原始方法引用
//   const originalMethod = descriptor.value;

//   // 修改方法的实现
//   descriptor.value = function(...args: any[]) {
//     console.log(`Calling method ${propertyName} with arguments: ${JSON.stringify(args)}`);
//     const result = originalMethod.apply(this, args);
//     console.log(`Method ${propertyName} returned: ${result}`);
//     return result;
//   };
// }

abstract class ElectronApi {

   apiName: string;

   event : any;

   constructor() {
     this.apiName = this.getApiName()
   }

   getEvent(){
     return this.event
   }

   setEvent(event: any){
     this.event = event
   }

  getApiName(): string{
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

