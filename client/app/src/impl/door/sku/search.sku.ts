import { SearchSkuApi } from "@eleapi/door/sku/search.sku";
import { InvokeType, Protocols } from "@eleapi/base";
import { MbEngine } from "@src/door/mb/mb.engine";
import log from "electron-log";
import { SearchSkuMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { searchSkuRecord, saveSearchSkuRecord } from "@api/door/door.api";
import { SearchSkuRecord } from "@model/door/door";

export class SearchSkuApiImpl extends SearchSkuApi{

    formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }

    @InvokeType(Protocols.INVOKE)
    async searchSku(publishResourceId : number, title : string){
        const skuId = await this.getSkuId(title);
        if(skuId){
            return skuId;
        }
        const engine = new MbEngine(publishResourceId);
        try{
            const page = await engine.init();
            if(!page){
                return;
            }
            const monitor = new SearchSkuMonitor();
            const date = this.formatDateToYYYYMMDD(new Date());
            const url = `https://s.taobao.com/search?initiative_id=staobaoz_${date}&page=1&q=${encodeURIComponent(title)}&tab=pc_taobao`;
            const result = await engine.openWaitMonitor(page, url, monitor);
            if(result){
                const skuId = result.data?.itemArrays[0]?.itemId;
                if(skuId){
                    const searchRecord = new SearchSkuRecord(undefined, this.getSearchType(), title, String(skuId));
                    await saveSearchSkuRecord(searchRecord);
                    return String(skuId);
                }
            }
            return undefined;
        }catch(error){
            log.error("searchSku error", error);
        }
    }

    getSearchType(): string {
        return "tb";
    }

    async getSkuId(title: string): Promise<string | undefined> {
        const result = await searchSkuRecord(this.getSearchType(), title);
        if(result){
            return result.skuId;
        }
        return undefined;
    }
}
