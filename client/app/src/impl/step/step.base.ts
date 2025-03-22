import { getSkuTaskSteps, initSkuStep, saveSkuTaskStep } from "@api/sku/skuTask.api"
import { SkuTaskStep, STEP_DONE, STEP_ERROR, STEP_INIT, STEP_PENDING } from "@model/sku/skuTask"
import { StepConfig } from "./step.config"
import { StepResult, StepUnit } from "./step.unit";
import { StepContext } from "./step.context";
import { validate } from "@src/validator/image.validator";
import log from "electron-log";
export abstract class StepHandler {

    private stepConfig: StepConfig;

    private context : StepContext;

    constructor(private readonly key: string, private readonly resourceId: number) {
        log.info("StepHandler constructor key is ", key);
        this.key = key;
        this.resourceId = resourceId;
        this.stepConfig = this.buildStepConfig();
        this.context = new StepContext(this.key, this.resourceId, this.getGroupCode());
    }

    public getParams(key: string) : any{
        return this.context.getItem(this.getStoreKey(key));
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
    }

    getHeaderKey(key : string) : string {
        return `step_header_${key}`;
    }

    getHeaderAllKey() : string {
        return `step_header_all`;
    }
    
    abstract getGroupCode(): string;

    async buildSteps(): Promise<StepUnit[]>{
        await this.init();
        const stepCodes = this.stepConfig.getStepCodes();
        const steps = []
        for (const stepCode of stepCodes) {
            const step = new SkuTaskStep(undefined, this.key, this.resourceId, stepCode, undefined, STEP_INIT, this.getGroupCode())
            const stepUnit = this.stepConfig.buildStepUnit(step, this.context);
            await stepUnit.init(true);
            steps.push(stepUnit);
        }
        return steps;
    }

    getStoreKey(key : string) : string{
        return `step_params_${key}`;
    }

    async init(){
        await initSkuStep(this.key, this.resourceId, this.getGroupCode())
    }

    abstract buildStepConfig(): StepConfig;

    public async doStep(withParams : { [key: string]: any }) : Promise<StepResult | undefined> {
        const stepUnits = await this.getStepUnits();
        let result : StepResult | undefined = undefined;
        for (let i = 0; i < stepUnits.length; i++) {
            const stepUnit = stepUnits[i];
            if(i == 0){
                stepUnit.setWithParams(withParams);
            }
            const stepResult = await stepUnit.do(result?.needNextSkip || false);
            if(!stepResult.result){
                const validateResult = await this.validateAndRetry(stepUnit, stepResult);
                if(!validateResult.result){
                    return validateResult;
                }
            }
            result = stepResult;
        }
        return result;
    }

    async validateAndRetry(stepUnit : StepUnit, result : StepResult){
        if(!result.header || !result.validateUrl){
            return result;
        }
        const validateResult = await validate(this.resourceId, result.header, result.validateUrl, result.validateParams);
        if(!validateResult){
            return result;
        }
        if(validateResult.result && validateResult.header){
            stepUnit.setValidateTag(true);
            return await stepUnit.do(result.needNextSkip);
        }
        return result;
    }
    
    release(){
        this.context.release();
    }

    async saveStep(step: SkuTaskStep) {
        await saveSkuTaskStep(step)
    }

    async getStepUnits() : Promise<StepUnit[]> {
        const steps = await getSkuTaskSteps(this.key, this.resourceId, this.getGroupCode());
        if (!steps || steps.length === 0) {
            return await this.buildSteps();
        }
        const stepUnits = []
        for (const step of steps) {
            const stepUnit = this.stepConfig.buildStepUnit(step, this.context);
            stepUnits.push(stepUnit)
        }
        return this.rebuildSteps(stepUnits)
    }

    async rebuildSteps(stepUnits : StepUnit[]) : Promise<StepUnit[]>{
        const stepCodes = this.stepConfig.getStepCodes();
        if(stepCodes.length != stepUnits.length){
            return await this.buildSteps();
        }
        const dbStepCodeMap : { [key: string]: string } = {};
        for(const step of stepUnits){
            dbStepCodeMap[step.step.code] = step.step.code;
        }
        for (let i = 0; i < stepCodes.length; i++) {
            const stepCode = stepCodes[i];
            if(!dbStepCodeMap[stepCode]){
                return await this.buildSteps();
            }
        }
        return stepUnits;
    }
}
    
