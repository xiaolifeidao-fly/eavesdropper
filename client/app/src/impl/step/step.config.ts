import { SkuTaskStep } from "@model/sku/skuTask";
import { StepUnit } from "./step.unit";
import { StepContext } from "./step.context";

export class StepConfig {

    private steps: {[key : string] : new (...args: any[]) => StepUnit} = {};   
    
    private codes : string[] = []

    register(stepCode : string, stepClass : new (...args: any[]) => StepUnit){
        this.steps[stepCode] = stepClass;
        this.codes.push(stepCode)
    }

    buildStepUnit(step : SkuTaskStep, context : StepContext, stepIndex : number) : StepUnit{
        const stepClass = this.steps[step.code];
        return new stepClass(step, context, stepIndex);
    }
    
    getStepCodes() : string[]{
        return this.codes
    }

}