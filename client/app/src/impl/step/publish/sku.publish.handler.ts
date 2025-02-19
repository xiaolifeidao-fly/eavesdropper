import { StepHandler } from "../step.base";
import { SkuTaskStep } from "@model/sku/skuTask";
import { StepConfig } from "../step.config";
import { StepUnit } from "../step.unit";
import { SkuGetStep } from "./impl/sku.get";
import { SkuPublishFileUploadStep } from "./impl/fil.upload";
import { UpdateDraftStep } from "./impl/update.draft";
import { PublishSkuStep } from "./impl/publish.sku";
import { SkuBuildDraftStep } from "./impl/build.sku.draft";

export class SkuPublishHandler extends StepHandler {

    constructor(key: string, resourceId: number) {
        super(key, resourceId);
    }

    buildStepConfig(): StepConfig {
        const stepConfig = new StepConfig()
        stepConfig.register("SkuGetStep", SkuGetStep)
        stepConfig.register("SkuPublishFileUploadStep", SkuPublishFileUploadStep)
        stepConfig.register("SkuBuildDraftStep", SkuBuildDraftStep)
        stepConfig.register("UpdateDraftStep", UpdateDraftStep)
        stepConfig.register("PublishSkuStep", PublishSkuStep)
        return stepConfig
    }

    getGroupCode(): string {
        return "sku.publish.handler";
    }

}