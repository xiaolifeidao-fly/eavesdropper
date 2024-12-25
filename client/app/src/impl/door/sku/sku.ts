require('module-alias/register');

import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";

import { MbEngine } from "@src/door/mb/mb.engine";
import { addSku } from "@api/sku/sku.api";
import { Sku, SkuPublishStatitic, AddSkuReq } from "@model/sku/sku";
import { addSkuTask, updateSkuTask } from "@api/sku/skuTask.api";
import { AddSkuTaskReq, UpdateSkuTaskReq} from "@model/sku/skuTask";
import { Task } from "@model/task/task";
import { uploadFile } from "@src/door/mb/file/file";
import { MbSkuFileUploadMonitor } from "@src/door/monitor/mb/sku/mb.sku.file.upload.monitor";


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
        sku.status = "pending";

        try {
            const engine = new MbEngine(publishResourceId);
            const page = await engine.init();
            if(!page){ 
                return undefined;
            }
            //获取商品信息
            const skuData = await this.findMbSkuInfo(skuUrl);
            console.log("skuData: ", skuData);

            sku.name = "test";
            sku.sourceSkuId = "123";

            //上传图片信息
            // // 填充商品信息
            // const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);

            sku.status = "success";
        } catch (error) {
            sku.status = "error";
            console.error("publishShop error: ", error);
        } finally {
            // 保存商品信息
            const req = new AddSkuReq(sku.name, sku.sourceSkuId, taskId, sku.status, publishResourceId);
            const skuId = await addSku(req);
            sku.id = skuId as number;
            return sku;
        }
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishSkus(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        // 1. 创建task记录
        const req = new AddSkuTaskReq(skuUrls.length, publishResourceId);
        const taskId = await addSkuTask(req);
        const status = "pending";

        // 异步操作
        this.asyncBatchPublishSku(taskId as number, publishResourceId, skuUrls);
        //返回任务
        return new Task(taskId as number, status);
    }

    async asyncBatchPublishSku(taskId : number, publishResourceId : number, skuUrls : string[]) : Promise<void>{
        const statistic = new SkuPublishStatitic();
        statistic.taskId = taskId;
        statistic.totalNum = skuUrls.length;
        statistic.successNum = 0;
        statistic.errorNum = 0;

        let progress = 0;
        try {
            for(const skuUrl of skuUrls){
                progress++;

                //发布商品
                const sku = await this.publishSku(publishResourceId, skuUrl, taskId);
                if(!sku || sku.status == "error"){
                    // 发送错误事件
                    statistic.errorNum = statistic.errorNum + 1;
                    console.error("publishShop error");
                    return undefined;
                }
                console.log("result: ", sku);

                //通过事件发送给端 单个商品的结果以及进度
                statistic.successNum = statistic.successNum + 1;

                console.log("skuId: ", sku.id, "skuStatus: ", sku.status, "statistic: ", statistic);
                this.send("onPublishSkuMessage", sku.id, sku.status, statistic);

                if (progress % 2 == 0){
                    const req = new UpdateSkuTaskReq(progress, "pending");
                    await updateSkuTask(taskId as number, req);
                }
            }
        } finally {
            const req = new UpdateSkuTaskReq(progress, "done");
            await updateSkuTask(taskId as number, req);
        }
        return
    }

}

