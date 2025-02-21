import { saveSkuTaskStep } from "@api/sku/skuTask.api";
import { SkuTaskStep, STEP_DONE, STEP_ERROR, STEP_PENDING } from "@model/sku/skuTask";
import { get, set } from "@utils/store/electron";
import log from "electron-log";
import { StepContext } from "./step.context";

export class StepResponse {
    
    private key : string;
    private value : any;
    private store : boolean;

    constructor(key : string, value : any, store : boolean = true ){
        this.key = key;
        this.value = value;
        this.store = store;
    }
    public getKey() : string{
        return this.key;
    }
    public getValue() : any{
        return this.value;
    }
    public isStore() : boolean{
        return this.store;
    }
}

export class StepResult {

    public result : boolean
    public message : string
    public responseData : StepResponse[];
    public header : { [key: string]: any } | undefined
    public validateUrl : string | undefined
    public sourceUrl : string | undefined
    constructor(result : boolean, message : string, responseData : StepResponse[] = [], header : { [key: string]: any } | undefined = undefined, validateUrl : string | undefined = undefined, sourceUrl : string | undefined = undefined){
        this.result = result
        this.message = message
        this.responseData = responseData
        this.header = header
        this.validateUrl = validateUrl
        this.sourceUrl = sourceUrl
    }
}

export abstract class StepUnit {

    public step: SkuTaskStep;
    private withParams : { [key: string]: any } | undefined;
    private header : { [key: string]: any } | undefined;
    private context : StepContext;

    constructor(step : SkuTaskStep, context : StepContext){
        this.step = step;
        this.context = context;
    }

    public async init(saveFlag : boolean = true){
        if(saveFlag){
            await saveSkuTaskStep(this.step);
        }
    }

    public setWithParams(withParams : { [key: string]: any }){
        const keys = Object.keys(withParams)
        for(const key of keys){
            const storeParamValue = withParams[key]
            const storeParamKey = this.getStoreParamKey(key);
            if(!storeParamKey){
                continue;
            }
            this.context.putItem(storeParamKey, storeParamValue)
        }
        this.withParams = withParams
    }

    public setParamsByResponse(responseData : StepResponse[]){
        for(const response of responseData){
            const storeParamKey = this.getStoreParamKey(response.getKey());
            this.context.putItem(storeParamKey, response.getValue(), response.isStore())
        }
    }

    public setParams(key : string, value : any){
        const storeParamKey = this.getStoreParamKey(key);
        this.context.putItem(storeParamKey, value)
    }

    public setHeader(header : { [key: string]: any }){
        const keys = Object.keys(header)
        for(const key of keys){
            const headerValue = header[key]
            const storeHeaderKey = this.getHeaderKey(key);
            if(!storeHeaderKey){
                continue;
            }
            this.context.putItem(storeHeaderKey, headerValue)
        }
        const headerAllKey = this.getHeaderAllKey();    
        if(headerAllKey){
            this.context.putItem(headerAllKey, header)
        }
        this.header = header
    }

    getParams(key : string) : any {
        if(!this.withParams){
            const storeParamKey = this.getStoreParamKey(key);
            return this.context.getItem(storeParamKey);
        }
        return this.withParams[key]
    }

    getStoreParamKey(key : string) : string{
        return `step_params_${key}`;
    }

    getHeaderKey(key : string) : string {
        return `step_header_${key}`;
    }


    getHeaderAllKey() : string {
        return `step_header_all`;
    }
    
    getHeaderValue(key : string) : any {
        if(!this.header){
            const headerKey = this.getHeaderKey(key);
            return this.context.getItem(headerKey);
        }
        return this.header[key]
    }


    getHeader() : { [key: string]: any } {
        if(!this.header){
            const headerKey = this.getHeaderAllKey();
            return this.context.getItem(headerKey);
        }
        return this.header
    }

    async do() {
        try {
            if (this.step.status === STEP_DONE) {
                log.warn(`step ${this.step.code} is done`)
                return new StepResult(true, "");
            }
            await this.pendingStep();
            log.info("doStep start ", this.step.code);
            const result = await this.doStep();
            if(result.result){
                this.step.status = STEP_DONE;
                this.step.message = "执行成功"
            }else{
                this.step.status = STEP_ERROR;
                this.step.message = result.message;
            }
            if(result.responseData && result.responseData.length > 0){
                this.setParamsByResponse(result.responseData);
            }
            if(result.header){
                this.setHeader(result.header);
            }
            if(result.validateUrl){
                this.step.validateUrl = result.validateUrl;
            }
            log.info("doStep end ", this.step.code);
            return result;
        } catch (error) {
            this.step.status = STEP_ERROR;
            this.step.message = "发生未知异常";
            log.error(`step ${this.step.code} failed`, error)
            return new StepResult(false, this.step.message);
        }finally{
            await saveSkuTaskStep(this.step);
        }
    }   

    async pendingStep(){
        this.step.status = STEP_PENDING
        await saveSkuTaskStep(this.step);
    }

    abstract doStep(): Promise<StepResult>;
}   