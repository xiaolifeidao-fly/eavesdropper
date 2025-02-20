
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
import log from "electron-log";
import { FileInfo } from "@src/door/monitor/mb/file/file";
import { publishFromTb } from "@src/door/mb/sku/sku.publish";
import { uploadByFileApi } from "@src/door/mb/file/file.api";
import { DoorEntity } from "@src/door/entity";
import { app } from "electron";
import sharp from "sharp";
import { validate } from "@src/validator/image.validator";
import { getStringHash } from "@utils/crypto.util";
import { SkuPublishHandler } from "@src/impl/step/publish/sku.publish.handler";
export class MbSkuApiImpl extends MbSkuApi {


    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(publishResourceId : number, url: string) {
        const engine = new MbEngine(publishResourceId);
        try{
            const monitorChain = new MbShopDetailMonitorChain();
            const page = await engine.init();
            if(!page){ 
                return;
            }
            return await engine.openWaitMonitorChain(page, url, monitorChain);
        }catch(error){
            log.error("findMbSkuInfo error", error);
            return undefined;
        }finally{
            // await engine.closePage();
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

    async uploadSkuImages(publishResourceId : number, skuItem : DoorSkuDTO, headerData : { [key: string]: any }){
        const { newMainImages, newDetailImages } = await this.downloadSkuImages(skuItem);
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
        const skuItemId = skuItem.baseInfo.itemId;
        return await uploadByFileApi(publishResourceId, skuItemId, skuFileNames, headerData);
    }

    async getImage(mainImages : string[], detailImages : string[], itemId : string) {
        try {
            const newMainImages = [];
            const newDetailImages = [];
            const imagePath = path.join(path.dirname(app.getAppPath()),'images',itemId.toString());
            log.info("imagePath is ", imagePath);
            if(!fs.existsSync(imagePath)){
                fs.mkdirSync(imagePath, { recursive: true });
            }
            const headers = {
                "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            for(let index = 0; index < mainImages.length; index++){
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
            return { newMainImages, newDetailImages };
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
            if(width && height){
                log.info("resize image", width, height);
                await imageSharp
                .resize(width, height) // 设置宽高
                .toFile(imagePath); // 保存图片到指定路径
                return imagePath;
            }
            return undefined;
        } catch (error) {
            log.error('Error downloading images:', url);
            return undefined;
        }
    }


    async downloadSkuImages(skuItem : DoorSkuDTO){
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
        return this.getImage(mainImages, detailImages, skuItem.baseInfo.itemId);
    }


    async getSkuImages(publishResourceId : number, data : {}, skuId : number){
        const fileNames ={};
        // const monitor = new MbSkuFileUploadMonitor(publishResourceId, skuId, fileNames);
        // uploadFile(publishResourceId, paths, monitor);
    }

    async uploadImages(publishResourceId : number, skuItem : DoorSkuDTO, headerData : { [key: string]: any } = {}){
        const uplodaData = await this.uploadSkuImages(publishResourceId, skuItem, headerData); // skuId TODO
        if (!uplodaData){
            return [];
        }
        if(uplodaData.validateUrl && uplodaData.header){
            const result = await validate(publishResourceId, uplodaData.header, uplodaData.validateUrl);
            console.log('validate result', result);
            const skuFiles = await this.uploadImages(publishResourceId, skuItem, headerData);
            if(skuFiles){
                return uplodaData.skuFiles;
            }
            return [];
        }
        return uplodaData.skuFiles;
    }

    async getPriceRate(taskId : number) : Promise<{ [key: string]: any }[]>{
        //TODO 获取价格费率
        return [];
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<SkuPublishResult>{
        const skuPublishResult = new SkuPublishResult(taskId, publishResourceId, SkuStatus.PENDING);
        skuPublishResult.url = skuUrl;
        skuPublishResult.publishResourceId = publishResourceId;

        try {
            // 校验商品是否存在
            const checkSkuExistenceReq = new CheckSkuExistenceReq(skuUrl, publishResourceId);
            const checkResult = await checkSkuExistence(checkSkuExistenceReq);
            if(checkResult){ // 商品已存在
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品已存在";
                return skuPublishResult;
            }
            const priceRate = await this.getPriceRate(taskId);
            const withParams = {
                "skuUrl" : skuUrl,
                "resourceId" : publishResourceId,
                "priceRate" : priceRate
            }
            const skuUrlKey = getStringHash(skuUrl);
            const publishHandler = new SkuPublishHandler(skuUrlKey, publishResourceId);
            const result = await publishHandler.doStep(withParams);
            if(!result || !result.result){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = result?.message || "发布商品失败";
                return skuPublishResult;
            }
            const skuItem = publishHandler.getParams("skuItem");
            if(skuItem){
                skuPublishResult.name = skuItem.baseInfo.title;
                skuPublishResult.sourceSkuId = skuItem.baseInfo.itemId;
                skuPublishResult.publishSkuId = skuItem.baseInfo.itemId;
            }
            skuPublishResult.publishTime = formatDate(new Date());
            skuPublishResult.status = SkuStatus.SUCCESS;
            skuPublishResult.remark = "发布商品成功";
            const addSkuReq = plainToClass(AddSkuReq, skuPublishResult);
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
            const checkSkuExistenceReq = new CheckSkuExistenceReq(skuUrl, publishResourceId);
            const result = await checkSkuExistence(checkSkuExistenceReq);
            if(result){ // 商品已存在
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品已存在";
                return skuPublishResult;
            }

            const skuData = skuResult.data;
            const skuItem : DoorSkuDTO | null = await parseSku(skuData);
            if(!skuItem){
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品信息解析失败";
                return skuPublishResult;
            }
            skuPublishResult.name = skuItem.baseInfo.title;
            skuPublishResult.sourceSkuId = skuItem.baseInfo.itemId;
            skuPublishResult.publishSkuId = skuItem.baseInfo.itemId;
            skuPublishResult.publishTime = formatDate(new Date());
            const imageFileList = await this.uploadImages(publishResourceId, skuItem); // skuId TODO
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
    async batchPublishSkus(publishResourceId : number, publishConfig: SkuPublishConfig, skuUrls : string[]) : Promise<SkuTask|undefined>{
        // 1. 创建task记录
        const count = skuUrls.length;
        const priceRate = publishConfig.priceRate;
        const req = new AddSkuTaskReq(count, publishResourceId, "", priceRate);
        const taskId = await addSkuTask(req) as number;

        const skuTask = new SkuTask(taskId, SkuTaskStatus.PENDING, count, publishResourceId);
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

                const taskItem = new AddSkuTaskItemReq(task.id, skuUrl, SkuTaskItemStatus.SUCCESS, taskRemark);

                //发布商品
                const skuResult = await this.publishSku(task.publishResourceId, skuUrl, task.id);
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


