import { MbSkuApiImpl } from "@src/impl/door/sku/sku";
import { StepResponse, StepResult, StepUnit } from "../../step.unit";
import { uploadFile } from "@src/door/mb/file/file";
import { FileInfo, MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";
import log from "electron-log";
import { app } from "electron";
import path from "path";
import fs from "fs";

export class SkuPublishFileUploadStep extends StepUnit{


    async doStep(): Promise<StepResult> {
        const skuApi = new MbSkuApiImpl();
        const resourceId = this.getParams("resourceId");
        const skuItem = this.getParams("skuItem");
        const validateTag = this.getValidateTag();
        const skuSource = this.getParams("skuSource");
        const userDataPath = app.getPath('userData');
        const skuItemId = this.getParams("skuItemId");
        const imagePath = path.join(userDataPath,'images',skuItemId.toString());
        if(!fs.existsSync(imagePath)){
            fs.mkdirSync(imagePath, { recursive: true });
        }
        const uploadResult = await skuApi.uploadSkuImages(imagePath, skuSource, resourceId, skuItem, validateTag); // skuId TODO
        const imageFileList = uploadResult.skuFiles;
        const validateUrl = uploadResult.validateData?.validateUrl;
        const validateParams = uploadResult.validateData?.validateParams;
        const header = uploadResult.header;
        if(uploadResult && validateUrl){
            log.info("uploadResult validate is ", validateUrl);
            return new StepResult(false, "上传图片[验证失败]", [
                new StepResponse("imageFileList", [])
            ], header, validateUrl, validateParams);
        }
        if(!imageFileList || imageFileList.length === 0){
            return new StepResult(false, "上传图片失败");
        }
        this.setParams("skuItem", skuItem);
        this.setParams("imagePath", imagePath);
        const testFileUpload = process.env.TEST_FILE_UPLOAD;
        let testResult = false;
        if (testFileUpload && testFileUpload === "true"){
            testResult = true;
        }
        return new StepResult(!testResult, "上传成功", [
            new StepResponse("imageFileList", imageFileList)
        ]);
    }

}