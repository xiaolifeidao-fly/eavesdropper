import { StepHandler } from "../step.base";
import { SkuTaskStep } from "@model/sku/skuTask";
import { StepConfig } from "../step.config";
import { StepUnit } from "../step.unit";
import { SkuGetStep } from "./impl/sku.get";
import { SkuPublishFileUploadStep } from "./impl/file.upload";
import { UpdateDraftStep } from "./impl/update.draft";
import { PublishSkuStep } from "./impl/publish.sku";
import { SkuBuildDraftStep } from "./impl/build.or.save.draft";
import { PddSkuGetStep } from "./impl/pdd.sku.get";
import { TbSearchStep } from "./impl/tb.search";
import { PddSkuBuildDraftStep } from "./impl/pdd.build.or.save.draft";
import { TbPublishSearchStep } from "./impl/tb.search.publish";
import { SkuPddBuildPreCheckStep } from "./impl/pdd.build.pre.check";

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

export class PddSkuPublishHandler extends StepHandler {

    constructor(key: string, resourceId: number) {
        super(key, resourceId);
    }

    getGroupCode(): string {
        return "pdd.sku.publish.handler";
    }

    buildStepConfig(): StepConfig {
        const stepConfig = new StepConfig();
        stepConfig.register("PddSkuGetStep", PddSkuGetStep)
        stepConfig.register("SkuPublishFileUploadStep", SkuPublishFileUploadStep)
        stepConfig.register("SearchSkuStep", TbPublishSearchStep)
        stepConfig.register("SkuBuildPreCheckStep", SkuPddBuildPreCheckStep)
        stepConfig.register("TbSearchStep", TbSearchStep)
        stepConfig.register("PddSkuBuildDraftStep", PddSkuBuildDraftStep)
        stepConfig.register("UpdateDraftStep", UpdateDraftStep)
        stepConfig.register("PublishSkuStep", PublishSkuStep)
        return stepConfig;
    }
}
