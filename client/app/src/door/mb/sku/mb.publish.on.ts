import log from 'electron-log'
import { MbEngine } from '../mb.engine';
import { getSkuByPublishResourceIdAndPublishSkuId } from '@api/sku/sku.api';
import { getDoorRecord, parseSku } from '@api/door/door.api';
import { PDD } from '@enums/source';
import { DoorSkuDTO } from '@model/door/sku';
import axios from 'axios';

export async function onResponse(resourceId : number){

    log.info("context on page ");
    const monitorKey = "PxxSkuMonitor";
    const engine = new MbEngine(resourceId, false);
    const page = await engine.init("https://myseller.taobao.com/home.htm/SellManage/all?current=1&pageSize=50")
    const context = engine.getContext();
    if(!context){
        return;
    }
    context.on("response", async response => {
        const request = response.request();
        const requestUrl = request.url();
        if(requestUrl.includes("mtop.taobao.sell.pc.manage.async/1.0")){
            const responseData = await response.json();
            await printPirce(responseData, resourceId);
        }
    });
}

export async function syncPrice(resourceId : number){

//     curl 'https://shell.mkt.taobao.com/unified/singletreasure/getItemPromotions' \
//   -H 'accept: application/json, text/plain, */*' \
//   -H 'accept-language: zh-CN' \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: application/json' \
//   -b '_tb_token_=ivocW7iIFB3drD7vHgAd; _samesite_flag_=true; 3PcFlag=1742125787655; cookie2=114927b354d52c5ef2d9222a55fbd57c; t=fb9d8e713f19778ea78608db0d93736e; xlly_s=1; sgcookie=E100n83cL97K2G%2FPTgIa63cGCY64E73ufZ2E1146JCh0L%2BMtN6yTKO56G2Yg07EYPvIGIH4mc9tb9IZ4LFv5udJ64XlMV%2B5Wes0O7cV7l8%2BjZ4apC5jQk7%2BVUt%2BQcXYBqVPu; unb=2219493137665; sn=tb648771277740%3A%E9%98%BF%E5%AE%9D; uc1=cookie21=UtASsssmfA%3D%3D&cookie14=UoYaibHTkJabqw%3D%3D; csg=949e8ef4; _cc_=WqG3DMC9EA%3D%3D; cancelledSubSites=empty; skt=37b389c4e2dd64cd; cna=vNJdIJc8aAoBASQOC4+DIrY/; isg=BDQ0a22377CH7nt9mkG_ueRJBfSmDVj3KUe2mc6Vk79COdWD9h1ihxO4uXPhwZBP; mtop_partitioned_detect=1; _m_h5_tk=efd68c885a1b537d8c82e5bb1ee40e5b_1742232109705; _m_h5_tk_enc=d46f3e7758c3b7c0e1eb2514d27f82a4; XSRF-TOKEN=e1bcf05b-5dc0-4507-ba6f-2e4b92088988; tfstk=gJrxV4jh_TpYWuqxE-7kjvQVw16lxa2VVSyBjfcD57F8Z-K0o5VMXVG8dtlc7ZPTy5NrojZimlKtwStiomGmCceTsjt0oRAOBWcR3ocghce_Qmgaofcm6cea9TfhxM243coht6jnZVJrncl1jc_oV1wKMv1hxM2b3co1t6qDYQ6swvxsfqg6FQGrBfOsl5iWVxlWcAtjCQ6-abT6hqMXP8MmhAisf5w5eAlShcgb18_wCBcwhf-TRICOdWTIqht_2x3AP-GWfYr-HqhQhD-6fpMxkXwjN6yznY0TMqElDBkYPJhC4er3vfXJtXHMlTBJ7FujUg46TkKmdWjjeXXuXF8ZzYk-tTCB7FujUYhhElLw74kR.' \
//   -H 'origin: https://myseller.taobao.com' \
//   -H 'pragma: no-cache' \
//   -H 'priority: u=1, i' \
//   -H 'referer: https://myseller.taobao.com/home.htm/starb/single-act-app' \
//   -H 'sec-ch-ua: "Chromium";v="131", "Not_A Brand";v="24"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-site' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
//   --data-raw '{"curPage":1,"pageSize":100,"queryPageValid":true,"activityType":"","discountType":"","promotionLevel":1}'
     const url = "https://shell.mkt.taobao.com/unified/singletreasure/getItemPromotions";
     const data = {
        curPage: 2,
        pageSize: 100,
        queryPageValid: true,
        activityType: "",
        discountType: "",
        promotionLevel: 1
    }
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN",
        "content-type": "application/json",
        "origin": "https://myseller.taobao.com",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": "https://myseller.taobao.com/home.htm/starb/single-act-app",
        "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "XSRF-TOKEN": "e1bcf05b-5dc0-4507-ba6f-2e4b92088988",
        "cookie": "_tb_token_=ivocW7iIFB3drD7vHgAd; _samesite_flag_=true; 3PcFlag=1742125787655; cookie2=114927b354d52c5ef2d9222a55fbd57c; t=fb9d8e713f19778ea78608db0d93736e; xlly_s=1; sgcookie=E100n83cL97K2G%2FPTgIa63cGCY64E73ufZ2E1146JCh0L%2BMtN6yTKO56G2Yg07EYPvIGIH4mc9tb9IZ4LFv5udJ64XlMV%2B5Wes0O7cV7l8%2BjZ4apC5jQk7%2BVUt%2BQcXYBqVPu; unb=2219493137665; sn=tb648771277740%3A%E9%98%BF%E5%AE%9D; uc1=cookie21=UtASsssmfA%3D%3D&cookie14=UoYaibHTkJabqw%3D%3D; csg=949e8ef4; _cc_=WqG3DMC9EA%3D%3D; cancelledSubSites=empty; skt=37b389c4e2dd64cd; cna=vNJdIJc8aAoBASQOC4+DIrY/; isg=BDQ0a22377CH7nt9mkG_ueRJBfSmDVj3KUe2mc6Vk79COdWD9h1ihxO4uXPhwZBP; mtop_partitioned_detect=1; _m_h5_tk=efd68c885a1b537d8c82e5bb1ee40e5b_1742232109705; _m_h5_tk_enc=d46f3e7758c3b7c0e1eb2514d27f82a4; XSRF-TOKEN=e1bcf05b-5dc0-4507-ba6f-2e4b92088988; tfstk=gJrxV4jh_TpYWuqxE-7kjvQVw16lxa2VVSyBjfcD57F8Z-K0o5VMXVG8dtlc7ZPTy5NrojZimlKtwStiomGmCceTsjt0oRAOBWcR3ocghce_Qmgaofcm6cea9TfhxM243coht6jnZVJrncl1jc_oV1wKMv1hxM2b3co1t6qDYQ6swvxsfqg6FQGrBfOsl5iWVxlWcAtjCQ6-abT6hqMXP8MmhAisf5w5eAlShcgb18_wCBcwhf-TRICOdWTIqht_2x3AP-GWfYr-HqhQhD-6fpMxkXwjN6yznY0TMqElDBkYPJhC4er3vfXJtXHMlTBJ7FujUg46TkKmdWjjeXXuXF8ZzYk-tTCB7FujUYhhElLw74kR."
    }
    const response = await axios.post(url, data, {headers});
    console.log("response", response.data);
    await printPirce(response.data, resourceId);
}

async function printPirce(responseData : {[key: string]: any}, resourceId : number){
    const dataSource = responseData.model?.dataList;
    if(!dataSource){
        return;
    }
    for(const item of dataSource){
        const itemId = item.itemId;
        const price = item.minDiscountYuan;
        if(price){
            const priceNum = parseFloat(price);
            const sku = await getSkuByPublishResourceIdAndPublishSkuId(resourceId, itemId);
            if(sku && sku.sourceSkuId && sku.source){
                const doorKey = "PxxSkuMonitor";
                const skuInfo = await getDoorRecord(doorKey, sku.sourceSkuId, sku.source);
                if(!skuInfo){
                    log.log("skuInfo", sku.sourceSkuId, sku.source);
                    continue;
                }
                const skuData = skuInfo.data;
                const skuItem : DoorSkuDTO | null = await parseSku(sku.source, JSON.parse(skuData));
                if(!skuItem){
                    console.log("skuItem", sku.sourceSkuId, sku.source);
                    continue;
                }
                const minPrice = skuItem.doorSkuSaleInfo.price;
                const cha = priceNum - parseFloat(minPrice) ;
                if(cha <= 1.5){
                    log.info(sku.name, ",", priceNum, ",", minPrice, "," + cha);
                }
            }
        }
    }
}


export async function openMbDraft(resourceId : number, draftId : string){
    const engine = new MbEngine(resourceId, false);
    const page = await engine.init("https://item.upload.taobao.com/sell/v2/draft.htm?dbDraftId=" + draftId)
    if(!page){
        return;
    }
    await page.waitForTimeout(2000);
}