import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";


export class SkuPublishFileUploadStep extends StepUnit{


    async doStep(): Promise<StepResult> {
        const skuApi = new MbSkuApiImpl();
        const resourceId = this.getParams("resourceId");
        const skuItem = this.getParams("skuItem");
        const uploadResult = await skuApi.uploadSkuImages(resourceId, skuItem, {}); // skuId TODO
        const imageFileList = uploadResult.skuFiles;
        if(!imageFileList || imageFileList.length === 0){
            return new StepResult(false, "上传图片失败");
        }
        const validateUrl = uploadResult.validateUrl;
        const header = uploadResult.header;
        if(validateUrl){
            return new StepResult(false, "上传图片[验证失败]", [
                new StepResponse("imageFileList", [])
            ], header, validateUrl);
        }
        return new StepResult(true, "上传成功", [
            new StepResponse("imageFileList", imageFileList)
        ]);
    }

}