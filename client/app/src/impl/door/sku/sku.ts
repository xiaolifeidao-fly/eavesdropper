require('module-alias/register');

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

    async uploadSkuImages(publishResourceId : number, data : {}, skuId : number){
        const fileNames ={};
        const monitor = new MbSkuFileUploadMonitor(publishResourceId, skuId, fileNames);
        // uploadFile(publishResourceId, paths, monitor);
    }


    @InvokeType(Protocols.INVOKE)
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<SkuPublishResult>{
        const skuPublishResult = new SkuPublishResult(taskId, publishResourceId, SkuStatus.SUCCESS);
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

            const skuData = skuResult.data;
            const skuInfo = skuData.skuInfo;
            const skuItem = skuInfo.item;
            skuPublishResult.name = skuItem.title;
            skuPublishResult.sourceSkuId = skuItem.itemId;

            // 校验商品是否存在
            const checkSkuExistenceReq = new CheckSkuExistenceReq(skuUrl, publishResourceId);
            const result = await checkSkuExistence(checkSkuExistenceReq);
            if(result){ // 商品已存在
                skuPublishResult.status = SkuStatus.ERROR;
                skuPublishResult.remark = "商品已存在";
                return skuPublishResult;
            }

            //上传图片信息
            // // 填充商品信息
            // const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);

            // 发布商品ID
            skuPublishResult.publishSkuId = skuItem.itemId;
            skuPublishResult.publishTime = formatDate(new Date());
            const addSkuReq = plainToClass(AddSkuReq, skuPublishResult);
            const skuId = await addSku(addSkuReq) as number;
            skuPublishResult.id = skuId;
            return skuPublishResult;
        } catch (error: any) {
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

