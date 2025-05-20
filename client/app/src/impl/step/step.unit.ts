import { saveSkuTaskStep } from "@api/sku/skuTask.api";
import { SkuTaskStep, STEP_DONE, STEP_ERROR, STEP_PENDING, STEP_ROLLBACK } from "@model/sku/skuTask";
import { get, set } from "@utils/store/electron";
import log from "electron-log";
import { StepContext } from "./step.context";
import { StepLog, StepLogMessage } from "./step.log";

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
    public validateParams : { [key: string]: any } | undefined
    public sourceUrl : string | undefined
    public needNextSkip : boolean
    public stepIndex : number = 0
    constructor(result : boolean, message : string, responseData : StepResponse[] = [], header : { [key: string]: any } | undefined = undefined, validateUrl : string | undefined = undefined, validateParams : { [key: string]: any } | undefined = undefined, sourceUrl : string | undefined = undefined, needNextSkip : boolean = false){
        this.result = result
        this.message = message
        this.responseData = responseData
        this.header = header
        this.validateUrl = validateUrl
        this.validateParams = validateParams
        this.sourceUrl = sourceUrl
        this.needNextSkip = needNextSkip
    }

    getStepIndex() : number{
        return this.stepIndex;
    }

    setNeedNextSkip(needNextSkip : boolean){
        this.needNextSkip = needNextSkip;
    }
}


export abstract class StepUnit {
    private taskId : number;
    public step: SkuTaskStep;
    private withParams : { [key: string]: any } | undefined;
    private header : { [key: string]: any } | undefined;
    private context : StepContext;
    private validateTag : boolean = false;
    private skip : boolean;
    private stepIndex : number;
    public stepLogMessage : StepLogMessage;
    
    constructor(taskId : number, step : SkuTaskStep, context : StepContext, stepIndex : number){
        this.taskId = taskId;
        this.step = step;
        this.context = context;
        this.skip = false;
        this.stepIndex = stepIndex;
        let stepId = this.step.id;
        if(!stepId){
            stepId = 0;
        }
        this.stepLogMessage = new StepLogMessage(stepId);
    }

    public getStepIndex() : number{
        return this.stepIndex;
    }

    public async doRollBack(){
        this.step.status = STEP_ROLLBACK;
        await saveSkuTaskStep(this.step);
    }

    public isSkip() : boolean{
        return this.skip;
    }
    
    public isRollBack() : boolean{
        return false;
    }

    setSkip(isSkip : boolean){
        this.skip = isSkip;
    }

    public async init(saveFlag : boolean = true){
        if(saveFlag){
            if(!this.step.taskId){
                this.step.taskId = this.taskId;
            }
            const stepResult = await saveSkuTaskStep(this.step);
            if(stepResult){
                this.step.id = stepResult.id;
            }
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

    setValidateTag(tag : boolean){
        this.validateTag = tag;
    }

    getValidateTag() : boolean{
        return this.validateTag;
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

    async do(needNextSkip : boolean) {
        try {
            if (this.step.status === STEP_DONE) {
                log.warn(`step ${this.step.code} is done`)
                const result = new StepResult(true, "");
                result.setNeedNextSkip(this.step.needNextSkip);
                return result;
            }
            await this.pendingStep();
            log.info("doStep start ", this.step.code);
            if(this.isSkip() && !needNextSkip){
                this.step.status = STEP_DONE;
                this.step.message = "跳过"
                log.info("doStep skip ", this.step.code);
                return new StepResult(true, "跳过");
            }
            const result = await this.doStep();
            if(result.result){
                this.step.status = STEP_DONE;
                this.step.message = "执行成功"
            }else{
                this.step.status = STEP_ERROR;
                this.step.message = result.message;
            }
            this.step.needNextSkip = result.needNextSkip;
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
            if(!this.step.taskId){
                this.step.taskId = this.taskId;
            }
            await saveSkuTaskStep(this.step);
        }
    }   

    async pendingStep(){
        this.step.status = STEP_PENDING
        await saveSkuTaskStep(this.step);
    }

    abstract doStep(): Promise<StepResult>;
}   