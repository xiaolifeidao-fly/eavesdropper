
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
  SkuTaskItemStatus
} from '@model/sku/skuTask'
import { uploadFile } from "@src/door/mb/file/file";
import { MbSkuFileUploadMonitor } from "@src/door/monitor/mb/sku/mb.sku.file.upload.monitor";
import { plainToClass } from 'class-transformer'
import { parseSku } from "@api/door/door.api";
import { DoorSkuDTO } from "@model/door/sku";
import axios from "axios";
import fs from 'fs';
import path from "path";
import log from "electron-log";
import { FileInfo } from "@src/door/monitor/mb/file/file";
import { publishFromTb } from "@src/door/mb/sku/sku.publish";
import { SkuFile } from "@model/sku/sku.file";

export class MbSkuApiImpl extends MbSkuApi {


    @InvokeType(Protocols.INVOKE)
    async findMbSkuInfo(url: string) {
        const engine = new MbEngine(1);
        try{
            const monitorChain = new MbShopDetailMonitorChain();
            const page = await engine.init();
            if(!page){ 
                return;
            }
            return await engine.openWaitMonitorChain(page, url, monitorChain);
        }finally{
            await engine.closePage();
        }  
    }

    async uploadSkuImages(publishResourceId : number, skuItem : DoorSkuDTO, skuId : number){
        const { newMainImages, newDetailImages } = await this.downloadSkuImages(skuItem, skuId);
        const filePaths = [...newMainImages, ...newDetailImages];
        const skuFileNames: { [key: string]: FileInfo } = {};
        for (let index = 0; index < newMainImages.length; index++){
            const mainImage = newMainImages[index];
            let fileName = path.basename(mainImage);
            const indexOf = fileName.indexOf(".");
            if(indexOf >= 0){
                fileName = fileName.substring(0, indexOf);
            }
            skuFileNames[fileName] = new FileInfo(fileName, index, "main");
        }
        for (let index = 0; index < newDetailImages.length; index++){
            const detailImage = newDetailImages[index];
            let fileName = path.basename(detailImage);
            const indexOf = fileName.indexOf(".");
            if(indexOf >= 0){
                fileName = fileName.substring(0, indexOf);
            }
            skuFileNames[fileName] = new FileInfo(fileName, index, "detail");
        }   
        const monitor = new MbSkuFileUploadMonitor(publishResourceId, skuId, skuFileNames);
        return await uploadFile(publishResourceId, skuId, filePaths, monitor);
    }

    async getImage(mainImages : string[], detailImages : string[], skuId : number, itemId : string) {
        try {
            const newMainImages = [];
            const newDetailImages = [];
            if (fs.existsSync(path.join(__dirname, "images", skuId.toString()))) {
                fs.rmSync(path.join(__dirname, "images", skuId.toString()), { recursive: true });
            }
            fs.mkdirSync(path.join(__dirname, "images", skuId.toString()), { recursive: true });

            for(let index = 0; index < mainImages.length; index++){
                const mainImage = mainImages[index];
                // Download background image
                const bgResponse = await axios.get(mainImage, { responseType: 'arraybuffer' });
                const bgPath = path.join(__dirname, "images", skuId.toString(), `main_${itemId}_${index}.jpg`);
                fs.writeFileSync(bgPath, Buffer.from(bgResponse.data, 'binary'));
                newMainImages.push(bgPath);
            }
            for(let index = 0; index < detailImages.length; index++){
                const detailImage = detailImages[index];
                // Download slider image
                const pointResponse = await axios.get(detailImage, { responseType: 'arraybuffer' });
                const bgPath = path.join(__dirname, "images", skuId.toString(), `detail_${itemId}_${index}.jpg`);
                fs.writeFileSync(bgPath, Buffer.from(pointResponse.data, 'binary'));
                newDetailImages.push(bgPath);
            }
            return { newMainImages, newDetailImages };
        } catch (error) {
            console.error('Error downloading images:', error);
            return { newMainImages: [], newDetailImages: [] };
        }
    }

    async downloadSkuImages(skuItem : DoorSkuDTO, skuId : number){
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
        return this.getImage(mainImages, detailImages, skuId, skuItem.baseInfo.itemId);
    }


    async getSkuImages(publishResourceId : number, data : {}, skuId : number){
        const fileNames ={};
        const monitor = new MbSkuFileUploadMonitor(publishResourceId, skuId, fileNames);
        // uploadFile(publishResourceId, paths, monitor);
    }

    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<SkuPublishResult>{
        const skuPublishResult = new SkuPublishResult(taskId, publishResourceId, SkuStatus.PENDING);
        skuPublishResult.url = skuUrl;

        try {
            const engine = new MbEngine(publishResourceId);
            const page = await engine.init();
            if(!page){ 
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "页面初始化失败";
                return skuPublishResult;
            }

            //获取商品信息
            const skuResult = await this.findMbSkuInfo(skuUrl);
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
            const addSkuReq = plainToClass(AddSkuReq, skuPublishResult);
            const skuId = await addSku(addSkuReq) as number;
            skuPublishResult.id = skuId;
            const imageFileList = await this.uploadSkuImages(publishResourceId, skuItem,skuId );
            if(imageFileList){
                await publishFromTb(imageFileList, skuItem, publishResourceId, skuItem.baseInfo.itemId);
            }
            //上传图片信息
            // // 填充商品信息
            // const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);

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
    async batchPublishSkus(publishResourceId : number, skuUrls : string[]) : Promise<SkuTask|undefined>{
        // 1. 创建task记录
        const count = skuUrls.length;
        const req = new AddSkuTaskReq(count, publishResourceId);
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

