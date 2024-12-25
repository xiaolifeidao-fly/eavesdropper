require('module-alias/register');

import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";

import { formatDate } from "@utils/date";
import { MbEngine } from "@src/door/mb/mb.engine";
import { addSku } from "@api/sku/sku.api";
import { Sku, AddSkuReq } from "@model/sku/sku";
import { addSkuTask, updateSkuTask } from "@api/sku/skuTask.api";
import { AddSkuTaskReq, UpdateSkuTaskReq, SkuTask, SkuPublishStatitic } from "@model/sku/skuTask";
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
    async publishSku(publishResourceId : number, skuUrl : string, taskId : number) : Promise<Sku|undefined>{
        const sku = new Sku();
        sku.taskId = taskId;
        sku.publishResourceId = publishResourceId;
        sku.url = skuUrl;
        sku.status = "pending";

        try {
            const engine = new MbEngine(publishResourceId);
            const page = await engine.init();
            if(!page){ 
                return undefined;
            }
            //获取商品信息
            const skuResult = await this.findMbSkuInfo(skuUrl);
            if(!skuResult || !skuResult.code){
                return undefined;
            }

            const skuData = skuResult.data;
            const skuInfo = skuData.skuInfo;
            const skuItem = skuInfo.item;
            sku.name = skuItem.title;
            sku.sourceSkuId = skuItem.itemId;

            //上传图片信息
            // // 填充商品信息
            // const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);

            sku.status = "success";
        } catch (error) {
            sku.status = "error";
            console.error("publishShop error: ", error);
        } finally {
            if (sku.status == "success"){
                const publishTime = formatDate(new Date());
                sku.publishTime = publishTime;
            }

            const req = plainToClass(AddSkuReq, sku);
            const skuId = await addSku(req);
            sku.id = skuId as number;
            return sku;
        }
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, skuUrls : string[]) : Promise<SkuTask|undefined>{
        // 1. 创建task记录
        const req = new AddSkuTaskReq(skuUrls.length, publishResourceId);
        const taskId = await addSkuTask(req);
        const status = "pending";

        const skuTask = new SkuTask(taskId as number, status, skuUrls.length, publishResourceId);

        // 异步操作
        this.asyncBatchPublishSku(skuTask, skuUrls);
        //返回任务
        return skuTask;
    }

    async asyncBatchPublishSku(task : SkuTask, skuUrls : string[]) : Promise<void>{
        const statistic = new SkuPublishStatitic();
        statistic.taskId = task.id;
        statistic.totalNum = skuUrls.length;
        statistic.successNum = 0;
        statistic.errorNum = 0;
        statistic.status = "pending";

        const publishResourceId = task.publishResourceId;
        const taskId = task.id;
        if(!publishResourceId || !taskId){
            statistic.status = "error";
            this.send("onPublishSkuMessage", undefined, statistic);
            console.error("publishResourceId or taskId is null");
            return;
        }

        let progress = 0;
        try {
            for(const skuUrl of skuUrls){
                progress++;

                // 模拟延迟
                await new Promise(resolve => setTimeout(resolve, 1000));

                //发布商品
                const sku = await this.publishSku(publishResourceId, skuUrl, taskId);
                if(!sku || sku.status == "error"){
                    // 发送错误事件
                    statistic.errorNum = statistic.errorNum + 1;
                    console.error("publishShop error");
                    continue;
                }

                //通过事件发送给端 单个商品的结果以及进度
                statistic.successNum = statistic.successNum + 1;

                if (statistic.successNum + statistic.errorNum == skuUrls.length){
                    statistic.status = "done";
                }
                this.send("onPublishSkuMessage", sku, statistic);

                if (progress % 2 == 0){                    
                    // 更新任务状态
                    const req = new UpdateSkuTaskReq(progress, "pending");
                    await updateSkuTask(taskId as number, req);
                }
            }
        } finally {
            // 更新任务状态
            const req = new UpdateSkuTaskReq(progress, "done");
            await updateSkuTask(taskId as number, req);
        }
        return
    }

}

