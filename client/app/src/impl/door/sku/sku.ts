require('module-alias/register');

import {  InvokeType, Protocols } from "@eleapi/base";
import { MbShopDetailMonitorChain } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbSkuApi } from "@eleapi/door/sku/mb.sku";

import { MbEngine } from "@src/door/mb/mb.engine";
import { Sku, SkuPublishStatitic } from "@model/sku/sku";
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
    async publishShop(publishResourceId : number, skuUrl : string) : Promise<Sku|undefined>{
        const engine = new MbEngine(publishResourceId);
        const page = await engine.init();
        if(!page){ 
            return undefined;
        }
        //获取商品信息
        const skuData = await this.findMbSkuInfo(skuUrl);
        //上传图片信息


        // 填充商品信息
        const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);
        // 返回发布结果
        return new Sku(undefined, undefined, undefined, undefined);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishShops(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        // 创建任务要求是幂等
        
        
        // 异步操作
        for(const skuUrl of skuUrls){
            //发布商品
            const result = await this.publishShop(publishResourceId, skuUrl);
            if(!result){
                return undefined;
            }
            //通过事件发送给端 单个商品的结果以及进度
            this.send("notifyPublishShop", result.id, result.status, new SkuPublishStatitic());
        }
        //返回任务
        return new Task(undefined, undefined);
    }


}

