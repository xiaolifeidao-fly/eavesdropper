import { getSkuTaskSteps, initSkuStep, saveSkuTaskStep } from "@api/sku/skuTask.api"
import { SkuTaskStep, STEP_DONE, STEP_ERROR, STEP_INIT, STEP_PENDING } from "@model/sku/skuTask"
import log  from "electron-log"
import { StepConfig } from "./step.config"
import { StepResult, StepUnit } from "./step.unit";
import { StepContext } from "./step.context";

export abstract class StepHandler {

    private stepConfig: StepConfig;

    private context : StepContext;

    constructor(private readonly key: string, private readonly resourceId: number) {
        this.key = key;
        this.resourceId = resourceId;
        this.stepConfig = this.buildStepConfig();
        this.context = new StepContext(this.key, this.resourceId, this.getGroupCode());
    }

    public getParams(key: string) : any{
        return this.context.getItem(this.getStoreKey(key));
    }

    abstract getGroupCode(): string;

    async buildSteps(): Promise<StepUnit[]>{
        await this.init();
        const stepCodes = this.stepConfig.getStepCodes();
        const steps = []
        for (const stepCode of stepCodes) {
            const step = new SkuTaskStep(undefined, this.key, this.resourceId, stepCode, undefined, STEP_INIT, this.getGroupCode())
            const stepUnit = this.stepConfig.buildStepUnit(step, this.context, this.getGroupCode());
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
            result = await stepUnit.do();
            if(!result.result){
                return result;
            }
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
            const stepUnit = this.stepConfig.buildStepUnit(step, this.context, this.getGroupCode());
            stepUnits.push(stepUnit)
        }
        return this.rebuildSteps(stepUnits)
    }

    async rebuildSteps(stepUnits : StepUnit[]) : Promise<StepUnit[]>{
        const stepCodes = this.stepConfig.getStepCodes();
        if(stepCodes.length != stepUnits.length){
            return await this.buildSteps();
        }
        for (let i = 0; i < stepCodes.length; i++) {
            const stepCode = stepCodes[i];
            const stepUnit = stepUnits[i];
            if(stepUnit.step.code != stepCode){
                return await this.buildSteps();
            }
        }
        return stepUnits;
    }
}
    
