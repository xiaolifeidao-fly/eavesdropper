import { SearchSkuApi } from "@eleapi/door/sku/search.sku";
import { InvokeType, Protocols } from "@eleapi/base";
import { MbEngine } from "@src/door/mb/mb.engine";
import { SearchSkuMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { DoorEntity } from "@src/door/entity";

export class SearchSkuApiImpl extends SearchSkuApi{

    formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }

    @InvokeType(Protocols.INVOKE)
    async searchSku(publishResourceId : number, title : string, pddSkuId : string){
        const engine = new MbEngine(publishResourceId);
        try{
            const page = await engine.init();
            if(!page){
                return new DoorEntity(false, "打开商品搜索页失败");
            }
            const monitor = new SearchSkuMonitor();
            const date = this.formatDateToYYYYMMDD(new Date());
            const url = `https://s.taobao.com/search?initiative_id=staobaoz_${date}&page=1&q=${encodeURIComponent(title)}&tab=pc_taobao`;
            return await engine.openWaitMonitor(page, url, monitor);
        }finally{
            await engine.closePage();
        }
    }

}
