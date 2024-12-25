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

    @InvokeType(Protocols.INVOKE)
    async publishShop(publishResourceId : number, taskId : number, skuUrl : string) : Promise<Sku|undefined>{
        let status = "success";
        try {
            // const engine = new MbEngine(publishResourceId);
            // const page = await engine.init();
            // if(!page){ 
            //     return undefined;
            // }
            // //获取商品信息
            // const skuData = await this.findMbSkuInfo(skuUrl);
            // //上传图片信息

            // // 填充商品信息
            // const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);
        } catch (error) {
            status = "error";
            console.error("publishShop error: ", error);
        } finally {
            // 保存商品信息
            const req = new AddSkuReq(864073465826, taskId, status, publishResourceId);
            const skuId = await addSku(req);
            return new Sku(skuId as number, 864073465826, 1, status);
        }
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishShops(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        // 1. 创建task记录
        const req = new AddSkuTaskReq(skuUrls.length, publishResourceId);
        const taskId = await addSkuTask(req);
        const status = "pending";

        // 异步操作
        this.asyncBatchPublishShop(taskId as number, publishResourceId, skuUrls);
        //返回任务
        return new Task(taskId as number, status);
    }

    async asyncBatchPublishShop(taskId : number, publishResourceId : number, skuUrls : string[]) : Promise<void>{
        let progress = 0;
        try {
            for(const skuUrl of skuUrls){
                progress++;
                //发布商品
                const result = await this.publishShop(publishResourceId, taskId, skuUrl);
                if(!result){
                    console.error("publishShop error");
                    return undefined;
                }
                console.log("result: ", result);
                //通过事件发送给端 单个商品的结果以及进度
                this.send("onPublishShopMessage", result.id, result.status, new SkuPublishStatitic());
    
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

