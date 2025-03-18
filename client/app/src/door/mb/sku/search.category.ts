import { MbPublishSearchMonitor } from "@src/door/monitor/mb/sku/md.sku.info.monitor";
import { MbEngine } from "../mb.engine";
import axios from "axios";
import log from "electron-log";
import { DoorEntity } from "@src/door/entity";
import { buildValidateDoorEntity } from "@src/door/monitor/mb/mb.monitor";

async function getHeaderData(resourceId : number, validateTag : boolean){
    let headerless = true;
    if(validateTag){
        headerless = false;
    }
    const searchStartTraceId = "searchStartTraceId";
    const mbEngine = new MbEngine(resourceId, headerless);
    if(headerless){
        const headerData = mbEngine.getHeader();
        //TODO cookie失效 要做处理
        if(headerData){
            return {header : headerData, startTraceId : mbEngine.getParams(searchStartTraceId)};
        }
    }
    try{
        const page = await mbEngine.init();
        if(!page){
            return undefined;
        }
        const result = await mbEngine.openWaitMonitor(page, "https://item.upload.taobao.com/sell/ai/category.htm?type=category", new MbPublishSearchMonitor());
        if(!result || !result.getCode()){
            return undefined;
        }
        if(!result.code){
            return undefined;
        }
        if(!headerless){
            mbEngine.setHeader(result.getHeaderData());
            mbEngine.setParams(searchStartTraceId, result.getResponseHeaderData()['S_tid']);
        }
        return result.getHeaderData();
    }finally{
        await mbEngine.saveContextState();
        await mbEngine.closePage();
    }
}


export async function searchCategory(publishResourceId : number, title : string, validateTag : boolean){
    const headerData =  await getHeaderData(publishResourceId, validateTag);
    if(!headerData){
        return new DoorEntity<{}>(false, {});
    }
    const {header, startTraceId} = headerData;
    return await getCategoryInfo(header,startTraceId, title);
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
        const doorEntity = buildValidateDoorEntity(data);
        if(doorEntity){
            log.error("搜索商品分类 出现验证码 ", data);
            return doorEntity;
        }
        log.error("搜索商品分类失败", data);
        return new DoorEntity<{}>(false, {});
    }
    const categories = data.data?.category;
    if (!categories || categories.length == 0) {
        log.error("搜索商品分类失败", data);
        return new DoorEntity<{}>(false, {});
    }
    const category = categories[0];
    const categoryData = {categoryId : category.id, categoryName : category.name};
    return new DoorEntity<{}>(true, categoryData);
}