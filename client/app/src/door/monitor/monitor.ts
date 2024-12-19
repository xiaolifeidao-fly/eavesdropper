import { Page, Route , Request, BrowserContext, Response} from "playwright";
import { DoorEntity } from "../entity";
import { EventEmitter } from 'events';
const axios = require('axios');

function getUrlParameter(url: string) {
    const urlObj = new URL(url);
    return new URLSearchParams(urlObj.search);
}

export abstract class Monitor {

    finishTag: boolean = false;
    timeout: number;
    key : string | undefined = undefined;
    eventEmitter: EventEmitter;
    waitResolve: (value: DoorEntity | PromiseLike<DoorEntity>) => void = () => {};
    waitPromise: Promise<DoorEntity>;

    constructor(timeout: number = 10000){
        this.timeout = timeout;
        this.eventEmitter = new EventEmitter();
        this.waitPromise = new Promise<DoorEntity>((resolve) => {
            this.waitResolve = resolve;
        });
    }

   
    protected getItemKey(params : URLSearchParams): string | undefined {
        return undefined;
    }

    getItemKeys(url : string): string | undefined {
        return this.getItemKey(getUrlParameter(url));
    }

    abstract getKey(): string;

    public async doMatchResponse(response: Response){
        const url = response.url();
        const method = response.request().method();
        const headers = await response.request().allHeaders();
        return await this.isMatch(url, method, headers);
    }

    abstract isMatch(url: string, method: string, headers: {[key: string]: string;}): Promise<boolean>;  

    setFinishTag(finishTag: boolean){
        this.finishTag = finishTag;
    }


    public async start(){
        const monitor = this;
        this.setFinishTag(false);
        monitor.onceEnvet();
        setTimeout(async () => {
            if(monitor.finishTag){
                return;
            }
            await monitor._doCallback(new DoorEntity(false, {}));
            monitor.setFinishTag(true)
        }, this.timeout);
    }

    async _doCallback(doorEntity: DoorEntity, request: Request | undefined = undefined, response : Response | undefined = undefined) : Promise<void>{
        try{
            await this.doCallback(doorEntity, request, response);
        }finally{
            this.eventEmitter.emit(this.getEventKey(), doorEntity);
        }
    }

    getEventKey(): string{
        return this.constructor.name + "_" + 'actionCompleted';
    }

    async doCallback(doorEntity: DoorEntity, request: Request | undefined = undefined, response : Response | undefined = undefined) : Promise<void>{

    }

    async onceEnvet(){
        this.eventEmitter.once(this.getEventKey(), async (result: DoorEntity) => {
            this.waitResolve(result);
        });
    }


    async waitForAction(): Promise<DoorEntity>{
        return await this.waitPromise;
    }

}

export abstract class MonitorRequest extends Monitor {

    handler: undefined | ((request: Request | undefined, response: Response | undefined) => Promise<{} | undefined>) = undefined;

    setHandler(handler : (request: Request | undefined, response: Response | undefined) => Promise<{}|undefined>){
        this.handler = handler;
    }
}

  
export abstract class MonitorResponse extends Monitor {
    
    abstract getType(): string;

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

}

export abstract class MonitorChain {

    monitors: Monitor[] = [];

    data : {[key: string]: any} = {};

    constructor(){
        this.monitors = this.initMonitors();
    }

    abstract initMonitors(): Monitor[];

    public getKey(){
        return this.constructor.name;
    }

    public append(monitor: Monitor){
        this.monitors.push(monitor);
    }

    abstract getType() :string;

    public getMonitors(): Monitor[]{
        return this.monitors;
    }

    public async waitForAction(): Promise<DoorEntity>{
        const doorData: {[key: string]: any} = {};
        let result = true;
        for(let monitor of this.monitors){
            const doorEntity = await monitor.waitForAction();
            if(!doorEntity.code){
                result = false;
            }
            doorData[monitor.getKey()] = doorEntity.data;
        }
        return new DoorEntity(result, doorData);
    }

    protected getItemKey(params : URLSearchParams): string | undefined {
        return undefined;
    }

    getItemKeys(url : string): string | undefined {
        return this.getItemKey(getUrlParameter(url));
    }

}