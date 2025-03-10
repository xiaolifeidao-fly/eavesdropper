
import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";
import { StoreApi } from "@eleapi/store/store";
import { formatDate } from "@utils/date";
import { MbEngine } from "@src/door/mb/mb.engine";
import { addSku, checkSkuExistence } from "@api/sku/sku.api";
import { SkuPublishResult, AddSkuReq, SkuStatus, CheckSkuExistenceReq } from "@model/sku/sku";
import { addSkuTask, updateSkuTask } from "@api/sku/skuTask.api";
import {
  AddSkuTaskReq,
  UpdateSkuTaskReq,
  SkuTask,
  SkuPublishStatitic,
  SkuTaskStatus,
  AddSkuTaskItemReq,
  SkuTaskItemStatus,
  SkuPublishConfig
} from '@model/sku/skuTask'
import { plainToClass } from 'class-transformer'
import { parseSku } from "@api/door/door.api";
import { DoorSkuDTO } from "@model/door/sku";
import axios from "axios";
import fs from 'fs';
import path from "path";
import log, { info } from "electron-log";
import { FileInfo } from "@src/door/monitor/mb/file/file";
import { publishFromTb } from "@src/door/mb/sku/sku.publish";
import { uploadByFileApi } from "@src/door/mb/file/file.api";
import { DoorEntity } from "@src/door/entity";
import { app } from "electron";
import sharp from "sharp";
import { PddSkuPublishHandler, SkuPublishHandler } from "@src/impl/step/publish/sku.publish.handler";
import { getUrlParameter } from "@utils/url.util";
import { PDD, TB } from "@enums/source";
import { StepHandler } from "@src/impl/step/step.base";
export class MbSkuApiImpl extends MbSkuApi {


    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(publishResourceId : number, url: string) {
        const engine = new MbEngine(publishResourceId, false);
        try{
            const monitorChain = new MbShopDetailMonitorChain();
            const page = await engine.init();
            if(!page){ 
                return;
            }
            const result = await engine.openWaitMonitorChain(page, url, monitorChain);
            return result;
        }catch(error){
            log.error("findMbSkuInfo error", error);
            return new DoorEntity<any>(false, {});
        }finally{
            await engine.closePage();
        }  
    }

    async getSkuInfo(publishResourceId : number, skuUrl : string){
        let requestSuccess = false;
        let requestCount = 0;
        let skuResult : DoorEntity<any> |undefined = undefined;
        while(!requestSuccess && requestCount <=1 ){
            skuResult = await this.findMbSkuInfo(publishResourceId, skuUrl);
            if(!skuResult || !skuResult.code){
                log.info("findMbSkuInfo error", skuResult);
                requestCount++;
                continue;
            }
            requestSuccess = true;
        }
        return skuResult;
    }

    async uploadSkuImages(source : string, publishResourceId : number, skuItem : DoorSkuDTO, validateTag : boolean){
        const { newMainImages, newDetailImages,skuImages } = await this.downloadSkuImages(source, skuItem);
        const skuFileNames: { [key: string]: FileInfo } = {};
        for (let index = 0; index < newMainImages.length; index++){
            const mainImage = newMainImages[index];
            let fileName = path.basename(mainImage);
            const indexOf = fileName.indexOf(".");
            if(indexOf >= 0){
                fileName = fileName.substring(0, indexOf);
            }
            skuFileNames[fileName] = new FileInfo(fileName, index, "main", mainImage);
        }
        for (let index = 0; index < newDetailImages.length; index++){
            const detailImage = newDetailImages[index];
            let fileName = path.basename(detailImage);
            const indexOf = fileName.indexOf(".");
            if(indexOf >= 0){
                fileName = fileName.substring(0, indexOf);
            }
            skuFileNames[fileName] = new FileInfo(fileName, index, "detail", detailImage);
        }   
        if(skuImages){
            for(let index = 0; index < skuImages.length; index++){
                const skuImage = skuImages[index];
                let fileName = path.basename(skuImage);
                const indexOf = fileName.indexOf(".");
                if(indexOf >= 0){
                    fileName = fileName.substring(0, indexOf);
                }
                skuFileNames[fileName] = new FileInfo(fileName, index, "sku", skuImage);
            }
        }
        const skuItemId = skuItem.baseInfo.itemId;
        return await uploadByFileApi(publishResourceId, skuItemId, skuFileNames, validateTag);
    }

    async getImage(source : string, skuItem : DoorSkuDTO, mainImages : string[], detailImages : string[]) {
        try {
            const newMainImages = [];
            const newDetailImages = [];
            const itemId = skuItem.baseInfo.itemId;
            const imagePath = path.join(path.dirname(app.getAppPath()),'images',itemId.toString());
            log.info("imagePath is ", imagePath);
            if(!fs.existsSync(imagePath)){
                fs.mkdirSync(imagePath, { recursive: true });
            }
            const headers = {
                "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            let maxMainImageSize = mainImages.length;
            if(maxMainImageSize > 5){
                maxMainImageSize = 5;
            }
            for(let index = 0; index < maxMainImageSize; index++){
                const mainImage = mainImages[index];
                const bgPath = await this.downloadImages(imagePath, mainImage, headers, "main", itemId, index, true);
                if(bgPath){
                    newMainImages.push(bgPath);
                }
            }
            for(let index = 0; index < detailImages.length; index++){
                const detailImage = detailImages[index];
                const bgPath = await this.downloadImages(imagePath, detailImage, headers, "detail", itemId, index, false);
                if(bgPath){
                    newDetailImages.push(bgPath);
                }
            }
            const skuImages : string[] = [];
            const skuImageMap : { [key: string]: string } = {};
            if(source == PDD){
                const salesAttrs = skuItem.doorSkuSaleInfo.salesAttr;
                let index = 0;
                for (let salesAttr in salesAttrs){
                    const salesAttrValue = salesAttrs[salesAttr];
                    if(!salesAttrValue){
                        continue;
                    }
                    const hasImage = salesAttrValue.hasImage;
                    if(!hasImage){
                        continue;
                    }
                    const values = salesAttrValue.values;
                    for(let value of values){
                        const oriImageUrl = value.image;
                        let imageFileName : string | undefined = skuImageMap[oriImageUrl];
                        if(!imageFileName){
                            const type = "sku";
                            const bgPath = await this.downloadImages(imagePath, oriImageUrl, headers, type, itemId, index, true);
                            if(bgPath){
                                imageFileName = `${type}_${itemId}_${index}`;
                                skuImages.push(bgPath);
                                skuImageMap[oriImageUrl] = imageFileName;
                                index++;
                            }
                        }
                        value.image = imageFileName;
                    }
                }
                
            }
            return { newMainImages, newDetailImages, skuImages };
        } catch (error) {
            log.error('Error downloading images:', error);
            return { newMainImages: [], newDetailImages: [] };
        }
    }

    async downloadImages(imageFilePath : string, url : string, headers : any, type : string, itemId : string, index : number, needResize : boolean = false){
        try {
            const imagePath = path.join(imageFilePath, `${type}_${itemId}_${index}.jpg`);
            if (fs.existsSync(imagePath)) {
                return imagePath;
            }
            const bgResponse = await axios.get(url, { responseType: 'arraybuffer', headers:headers});
            const imageBuffer = Buffer.from(bgResponse.data, 'binary');
            const imageSharp = sharp(imageBuffer);
            if(needResize){
                await imageSharp
                .resize(800, 800) // 设置宽高
                .toFile(imagePath); // 保存图片到指定路径
                return imagePath;
            }
            const metadata = await imageSharp.metadata();
            let { width, height } = metadata;
            if(width && width > 2000){
                width = 2000;
            }
            if(height && height > 1600){
                height = 1600;
            }
            if((width && width >2000) || (height && height > 1600)){
                log.info("resize image", width, height);
                await imageSharp
                .resize(width, height) // 设置宽高
                .toFile(imagePath); // 保存图片到指定路径
                return imagePath;
            }else{
                await imageSharp
                .toFile(imagePath); // 保存图片到指定路径
                return imagePath;
            }
        } catch (error) {
            log.error('Error downloading images:', url);
            return undefined;
        }
    }


    async downloadSkuImages(source : string, skuItem : DoorSkuDTO){
        const mainImages = skuItem.baseInfo.mainImages;
        const infos = skuItem.doorSkuImageInfo.doorSkuImageInfos;
        const detailImages = [];
        for (let info of infos){
            const content = info.content;
            const type = info.type;
            if(type == "image"){
                detailImages.push(content);
            }
        }
        return this.getImage(source, skuItem, mainImages, detailImages);
    }


    async uploadImages(source: string, publishResourceId : number, skuItem : DoorSkuDTO, validateTag : boolean = false){
        const uplodaData = await this.uploadSkuImages(source, publishResourceId, skuItem, validateTag); // skuId TODO
        if (!uplodaData){
            return [];
        }
        if(uplodaData.validateUrl && uplodaData.header){
            return [];
        }
        return uplodaData.skuFiles;
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuSource: string, skuUrl : string, taskId : number, publishConfig?: SkuPublishConfig) : Promise<SkuPublishResult>{
        const skuPublishResult = new SkuPublishResult(taskId, publishResourceId, SkuStatus.PENDING);
        skuPublishResult.url = skuUrl;
        skuPublishResult.publishResourceId = publishResourceId;

        try {
            const urlParams = getUrlParameter(skuUrl);
            let skuItemId = urlParams.get("id");
            if(skuSource == PDD){
                skuItemId = urlParams.get("goods_id");
            }
            if(!skuItemId){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品链接未找到商品ID";
                return skuPublishResult;
            }
            // 校验商品是否存在
            const checkSkuExistenceReq = new CheckSkuExistenceReq(skuItemId, publishResourceId, skuSource);
            const checkResult = await checkSkuExistence(checkSkuExistenceReq);
            if(checkResult){ // 商品已存在
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品已存在";
                return skuPublishResult;
            }
            const withParams = {
                "skuSource": skuSource,
                "skuUrl" : skuUrl,
                "resourceId" : publishResourceId,
                "priceRate" : publishConfig?.priceRate,
                "skuItemId": skuItemId,
            }
            // const publishHandler = new SkuPublishHandler(skuItemId, publishResourceId);
            let publishHandler : StepHandler;
            if(skuSource == PDD){
                publishHandler = new PddSkuPublishHandler(skuItemId, publishResourceId);
            }else{
                publishHandler = new PddSkuPublishHandler(skuItemId, publishResourceId);
            }
            const result = await publishHandler.doStep(withParams);
            if(!result || !result.result){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = result?.message || "发布商品失败";
                return skuPublishResult;
            }
            const skuItem = publishHandler.getParams("skuItem");
            const newSkuId = publishHandler.getParams("newSkuId");
            if(skuItem){
                skuPublishResult.name = skuItem.baseInfo.title;
                skuPublishResult.sourceSkuId = skuItem.baseInfo.itemId;
                skuPublishResult.publishSkuId = newSkuId;
            }
            skuPublishResult.publishTime = formatDate(new Date());
            skuPublishResult.status = SkuStatus.SUCCESS;
            skuPublishResult.remark = "发布商品成功";
            const addSkuReq = plainToClass(AddSkuReq, skuPublishResult);
            addSkuReq.source = skuSource;
            const skuId = await addSku(addSkuReq) as number;
            skuPublishResult.id = skuId;
            publishHandler.release();
            // 发布商品ID
            return skuPublishResult;
        } catch (error: any) {
            log.error("publishSku error", error);
            skuPublishResult.status = SkuStatus.ERROR;
            skuPublishResult.remark = error.message;
            return skuPublishResult;
        }   
    }

    async publishSkuByOld(publishResourceId : number, skuUrl : string, taskId : number){
        const skuPublishResult = new SkuPublishResult(taskId, publishResourceId, SkuStatus.PENDING);
        skuPublishResult.url = skuUrl;

        try {
            //获取商品信息
            const skuResult = await this.getSkuInfo(publishResourceId, skuUrl);
            if(!skuResult || !skuResult.code){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "获取商品信息失败";
                return skuPublishResult;
            }
  
            // 校验商品是否存在
            const checkSkuExistenceReq = new CheckSkuExistenceReq(skuUrl, publishResourceId, TB);
            const result = await checkSkuExistence(checkSkuExistenceReq);
            if(result){ // 商品已存在
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品已存在";
                return skuPublishResult;
            }

            const skuData = skuResult.data;
            const skuItem : DoorSkuDTO | null = await parseSku(TB, skuData);
            if(!skuItem){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品信息解析失败";
                return skuPublishResult;
            }
            skuPublishResult.name = skuItem.baseInfo.title;
            skuPublishResult.sourceSkuId = skuItem.baseInfo.itemId;
            skuPublishResult.publishSkuId = skuItem.baseInfo.itemId;
            skuPublishResult.publishTime = formatDate(new Date());
            const imageFileList = await this.uploadImages(TB, publishResourceId, skuItem); // skuId TODO
            if(imageFileList && imageFileList.length > 0){
                const result = await publishFromTb(imageFileList, skuItem, publishResourceId, skuItem.baseInfo.itemId);
                if(!result){
                    skuPublishResult.status = SkuStatus.ERROR;
                    skuPublishResult.remark = "发布商品失败";
                    return skuPublishResult;
                }
                skuPublishResult.status = SkuStatus.SUCCESS;
                skuPublishResult.remark = "发布商品成功";
            }else{
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "上传图片失败";
            }
            const addSkuReq = plainToClass(AddSkuReq, skuPublishResult);
            const skuId = await addSku(addSkuReq) as number;
            skuPublishResult.id = skuId;
            // 发布商品ID
            return skuPublishResult;
        } catch (error: any) {
            log.error("publishSku error", error);
            skuPublishResult.status = SkuStatus.ERROR;
            skuPublishResult.remark = error.message;
            return skuPublishResult;
        }   
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, publishConfig: SkuPublishConfig, skuSource: string, skuUrls : string[]) : Promise<SkuTask|undefined>{
        // 1. 创建task记录
        const count = skuUrls.length;
        const priceRate = publishConfig.priceRate;
        const req = new AddSkuTaskReq(count, publishResourceId, skuSource,  "", priceRate);
        const taskId = await addSkuTask(req) as number;

        const skuTask = new SkuTask(taskId, SkuTaskStatus.PENDING, count, publishResourceId, skuSource, publishConfig);
        // 异步操作
        this.asyncBatchPublishSku(skuTask, skuUrls);
        //返回任务
        return skuTask;
    }

    async asyncBatchPublishSku(task : SkuTask, skuUrls : string[]) : Promise<void>{
        let taskStatus = SkuTaskStatus.RUNNING;
        const statistic = new SkuPublishStatitic(task.id, task.count, 0, 0, taskStatus);

        // 设置任务状态为进行中
        const store = new StoreApi();
        const taskKey = `task_${task.id}`;
        await store.setItem(taskKey, true);

        let progress = 0;
        let taskRemark = "";
        let taskItems: AddSkuTaskItemReq[] = [];

        let i = 0;
        try {
            for(;i < skuUrls.length; i++){
                // 模拟延迟
                // await new Promise(resolve => setTimeout(resolve, 1000));

                const skuUrl = skuUrls[i];
                const taskStoreStatus = await store.getItem(taskKey);
                if(!taskStoreStatus){
                    taskStatus = SkuTaskStatus.DONE;
                    break;
                }

                const taskItem = new AddSkuTaskItemReq(task.id, skuUrl, SkuTaskItemStatus.SUCCESS, task.source, taskRemark);

                //发布商品
                const skuResult = await this.publishSku(task.publishResourceId, task.source, skuUrl, task.id, task.skuPublishConfig);
                skuResult.key = progress;
                if(skuResult.status == SkuStatus.ERROR){
                    statistic.errorNum = statistic.errorNum + 1;
                    taskItem.status = SkuTaskItemStatus.FAILED;
                    taskItem.remark = skuResult.remark;
                } else {
                    statistic.successNum = statistic.successNum + 1;
                }
                taskItems.push(taskItem); // 添加任务项

                // 更新任务状态
                progress++;
                taskStatus = progress == task.count ? SkuTaskStatus.DONE : taskStatus;
                statistic.status = taskStatus;
                this.send("onPublishSkuMessage", skuResult, statistic); // 发送进度

                // 更新任务状态
                if (progress % 2 == 0){                    
                    // 更新任务状态
                    const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems);
                    await updateSkuTask(task.id, req);
                    taskItems = [];
                }
            }
        } catch (error: any) {
            taskStatus = SkuTaskStatus.ERROR;
            taskRemark = error.message;
            statistic.status = taskStatus;
            this.send("onPublishSkuMessage", undefined, statistic); // 发送进度
        } finally {
            await store.removeItem(taskKey);
            for (;i<skuUrls.length;i++){
                let itemStatus = SkuTaskItemStatus.CANCEL;
                if (taskStatus == SkuTaskStatus.ERROR){
                    itemStatus = SkuTaskItemStatus.FAILED;
                }
                const taskItem = new AddSkuTaskItemReq(task.id, skuUrls[i], itemStatus, taskRemark);
                taskItems.push(taskItem);
            }
            if (taskItems.length <= 0 && statistic.status == SkuTaskStatus.DONE) {
                return;
            }
            // 更新任务状态
            const req = new UpdateSkuTaskReq(taskStatus, taskRemark, taskItems);
            await updateSkuTask(task.id, req);
        }
        return
    }

}


