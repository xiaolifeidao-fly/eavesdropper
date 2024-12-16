import { Page, Route , Request, BrowserContext, Response} from "playwright";
import { DoorEntity } from "../entity";
import log from "electron-log";
import { EventEmitter } from 'events';
const axios = require('axios');

export abstract class Monitor {

    finishTag: boolean = false;
    timeout: number;

    eventEmitter: EventEmitter;

    constructor(timeout: number = 60000){
        this.timeout = timeout;
        this.eventEmitter = new EventEmitter();
    }

    public async doMatchResponse(response: Response){
        const url = response.url();
        const method = response.request().method();
        const headers = await response.request().allHeaders();
        return this.isMatch(url, method, headers);
    }

    abstract isMatch(url: string, method: string, headers: {[key: string]: string;}): Promise<boolean>;  

    setFinishTag(finishTag: boolean){
        this.finishTag = finishTag;
    }


    abstract start(): Promise<void>;

    async _doCallback(doorEntity: DoorEntity, request: Request | undefined = undefined, response : Response | undefined = undefined) : Promise<void>{
        try{
            await this.doCallback(doorEntity, request, response);
        }finally{
            this.eventEmitter.emit('actionCompleted', doorEntity);
        }
    }

    async doCallback(doorEntity: DoorEntity, request: Request | undefined = undefined, response : Response | undefined = undefined) : Promise<void>{

    }


    async waitForAction(): Promise<DoorEntity>{
        return await new Promise<DoorEntity>((resolve) => {
            this.eventEmitter.once('actionCompleted', (result: DoorEntity) => {
                resolve(result);
            });
        });
    }

}

export abstract class MonitorRequest extends Monitor {

    handler: undefined | ((request: Request | undefined, response: Response | undefined) => Promise<{} | undefined>) = undefined;

    public async start(){
        setTimeout(async () => {
            if(!this.finishTag){
                return;
            }
            await this.doCallback(new DoorEntity(false, {}));
            this.setFinishTag(true)
        }, this.timeout);
    }

    setHandler(handler : (request: Request | undefined, response: Response | undefined) => Promise<{}|undefined>){
        this.handler = handler;
    }
}

  
export abstract class MonitorResponse extends Monitor {


    public async getResponseData(response: Response): Promise<any>{
        const contentType = response.headers()['content-type'];
        if(contentType.includes('application/json')){
            return await response.json();
        }
        if (contentType && contentType.includes('text/html')) {
            return await response.text();
        }
        return await response.body();
    }

    public async start(){
        setTimeout(async () => {
            if(!this.finishTag){
                return;
            }
            await this.doCallback(new DoorEntity(false, {}));
            this.setFinishTag(true)
        }, this.timeout);
    }

}