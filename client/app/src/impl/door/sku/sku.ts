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
        const skuData = await this.findMbSkuInfo(skuUrl);


        // const monitor = new MbShopInfoMonitor();
        const result = await engine.doFillWaitForElement(page, "1.0.1", "publishSku", skuData);
        return new Sku(undefined, undefined, undefined, undefined);
    }

    @InvokeType(Protocols.INVOKE)
    async batchPublishShops(publishResourceId : number, skuUrls : string[]) : Promise<Task|undefined>{
        for(const skuUrl of skuUrls){
            const result = await this.publishShop(publishResourceId, skuUrl);
            if(!result){
                return undefined;
            }
            this.send("notifyPublishShop", result.id, result.status, new SkuPublishStatitic());
        }
        return new Task(undefined, undefined);
    }


}

