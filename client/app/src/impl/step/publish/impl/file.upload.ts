import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";


export class SkuPublishFileUploadStep extends StepUnit{


    async doStep(): Promise<StepResult> {
        const skuApi = new MbSkuApiImpl();
        const resourceId = this.getParams("resourceId");
        const skuItem = this.getParams("skuItem");
        const validateTag = this.getValidateTag();
        const skuSource = this.getParams("skuSource");
        const uploadResult = await skuApi.uploadSkuImages(skuSource, resourceId, skuItem, validateTag); // skuId TODO
        const imageFileList = uploadResult.skuFiles;
        const validateUrl = uploadResult.validateUrl;
        const header = uploadResult.header;
        if(validateUrl){
            return new StepResult(false, "上传图片[验证失败]", [
                new StepResponse("imageFileList", [])
            ], header, validateUrl);
        }
        if(!imageFileList || imageFileList.length === 0){
            return new StepResult(false, "上传图片失败");
        }
        this.setParams("skuItem", skuItem);
        return new StepResult(false, "上传成功", [
            new StepResponse("imageFileList", imageFileList)
        ]);
    }

}