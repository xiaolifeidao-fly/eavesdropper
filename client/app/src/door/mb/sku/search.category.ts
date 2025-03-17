import { MbPublishSearchMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbEngine } from "../mb.engine";
import axios from "axios";
import log from "electron-log";



export async function searchCategory(publishResourceId : number, title : string){
    const engine = new MbEngine(publishResourceId);
    try{
        const page = await engine.init();
        if(!page){
            return undefined;
        }
        const result = await engine.openWaitMonitor(page, "https://item.upload.taobao.com/sell/ai/category.htm?type=category", new MbPublishSearchMonitor());
        if(!result || !result.getCode()){
            return undefined;
        }
        const requestHeader = result.getHeaderData();
        const responseHeader = result.getResponseHeaderData();
        const startTraceId = responseHeader['S_tid'];
        return await getCategoryInfo(requestHeader,startTraceId, title);
    }finally{
        engine.closePage();
    }
}

async function getCategoryInfo(requestHeader : { [key: string]: any }, startTraceId: string, categoryKeyword: string) {
    requestHeader['origin'] = "https://item.upload.taobao.com";
    requestHeader['referer'] = "https://item.upload.taobao.com/sell/ai/category.htm?type=category";
    requestHeader['accept'] = "application/json, text/plain, */*";
    requestHeader['accept-language'] = "zh-CN,zh;q=0.9";
    requestHeader['cache-control'] = "no-cache";
    requestHeader['pragma'] = "no-cache";
    requestHeader['priority'] = "u=0, i";
    requestHeader['sec-fetch-dest'] = "empty";
    requestHeader['sec-fetch-mode'] = "cors";
    requestHeader['sec-fetch-site'] = "same-origin";
    requestHeader['x-requested-with'] = "XMLHttpRequest";

    delete requestHeader['upgrade-insecure-requests'];

    const jsonBody = encodeURIComponent(JSON.stringify({
        keyword: categoryKeyword
    }));
    const globalExtendInfo = encodeURIComponent(JSON.stringify({
        startTraceId: startTraceId,
        newImageUi: true
    }));
    const url = "https://item.upload.taobao.com/sell/ai/asyncOpt.htm?optType=retrievalDataAsyncOpt&jsonBody=" + jsonBody + "&globalExtendInfo=" + globalExtendInfo;
    log.info("get category info url: ", url);
    log.info("get category info requestHeader: ", requestHeader);
    const response = await axios.get(url, {
        headers: requestHeader,
    });
    const data = response.data;
    if (!data.success) {
        log.error("搜索商品分类失败", data);
        return undefined;
    }
    const categories = data.data?.category;
    if (!categories || categories.length == 0) {
        log.error("搜索商品分类失败", data);
        return undefined;
    }
    const category = categories[0];
    return {categoryId : category.id, categoryName : category.name};
}