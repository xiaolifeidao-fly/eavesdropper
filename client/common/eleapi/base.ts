export abstract class ElectronApi {

   apiName: string;

   constructor() {
     this.apiName = this.getApiName()
   }

   abstract getApiName(): string;


    
}

