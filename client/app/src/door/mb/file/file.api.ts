import { FileData, FileInfo, getFileKey, MbFileUploadMonitor } from "@src/door/monitor/mb/file/file";

import { getSkuFiles, saveSkuFile } from "@api/sku/sku.file";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from 'form-data';
import { DoorFileRecord } from "@model/door/door";
import { SkuFile } from "@model/sku/sku.file";
import { getUnUploadFile, uploadFile } from "./file";
import { MbFileQueryMonitor } from "@src/door/monitor/mb/file/file";
import { MbEngine } from "../mb.engine";
import { saveDoorFileRecord } from "@api/door/file.api";
import { Page } from "playwright";
import log from "electron-log";

function getFilePaths(skuFileNames: { [key: string]: FileInfo } = {}){
    const filePaths = [];
    for(let key in skuFileNames){
        const fileInfo = skuFileNames[key];
        filePaths.push(fileInfo.filePath);
    }
    return filePaths;
}

export async function uploadByFileApi(resourceId : number, skuItemId : string, skuFileNames: { [key: string]: FileInfo } = {}, validateTag : boolean = false) {
    const fileQueryMonitor = new MbFileQueryMonitor();
    const paths = getFilePaths(skuFileNames);
    const unUploadFiles = await getUnUploadFile(fileQueryMonitor.getType(), resourceId, paths);
    log.info("unUploadFiles size ", unUploadFiles.length);
    if(unUploadFiles.length === 0){
        const skuFiles = await getSkuFiles(skuItemId, resourceId);
        return {
            skuFiles : skuFiles,
            validateData : undefined,
            header : undefined
        };
    }
    const header = await getHeaderData(resourceId, validateTag, fileQueryMonitor);
    if(!header){
        return {
            skuFiles : [],
            validateData : undefined,
            header : undefined
        };
    }
    const uploadResult = await uploadFileByFileApi(fileQueryMonitor.getType(), resourceId, skuItemId, unUploadFiles, skuFileNames, header);
    const skuFiles = await getSkuFiles(skuItemId, resourceId);
    return {
        skuFiles : skuFiles,
        validateData : uploadResult,
        header : header
    };
}

async function getHeaderData(resourceId : number, validateTag : boolean, fileQueryMonitor : MbFileQueryMonitor){
    // let headerless = true;
    // if(validateTag){
    //     headerless = false;
    // }
    let mbEngine = new MbEngine(resourceId);
    if(!validateTag){
        const headerData = mbEngine.getHeader();
        //TODO cookie失效 要做处理
        if(headerData){
            return headerData;
        }
    }

    const validateAutoTag = mbEngine.getValidateAutoTag();
    log.info("upload image show page ", !validateAutoTag);
    if(!validateAutoTag){
        mbEngine = new MbEngine(resourceId, false);
    }
    let result;
    try{
        const page = await mbEngine.init();
        if(!page){
            return undefined;
        }
        mbEngine.addMonitor(fileQueryMonitor);
        result = await mbEngine.openWaitMonitor(page, "https://qn.taobao.com/home.htm/sucai-tu/home", fileQueryMonitor);
        if(!result.code){
            return {
                skuFiles : [],
                validateUrl : undefined,
                header : undefined
            };
        }
        // if(validateTag){
        mbEngine.setHeader(result.getHeaderData());
        // }
        return result.getHeaderData();
    }finally{
        if(result){
            await mbEngine.saveContextState();
        }
        await mbEngine.closePage();
    }
}


const MAX_RETRIES = 3; // 最大重试次数

async function uploadFileByFileApi(source : string, resourceId : number, skuItemId : string, unUploadFiles: string[], skuFileNames: { [key: string]: FileInfo } = {}, headerData : { [key: string]: string; }){

    //Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.6778.33 Safari/537.36
    for(let filePath of unUploadFiles){
        const form = new FormData();
        //合并headerData
        const headers : { [key: string]: string } = {
            ...headerData,
            ...form.getHeaders(),
            ...{
                "Origin" : "https://qn.taobao.com",
                "Connection" : "keep-alive"
            }
        }
        delete headers['referer'];
        headers['accept'] = "application/json, text/plain, */*";
        headers['accept-language'] = "zh-CN,zh;q=0.9";
        headers['cache-control'] = "no-cache";
        headers['pragma'] = "no-cache";
        headers['priority'] = "u=0, i";
        headers['sec-fetch-dest'] = "empty";
        headers['sec-fetch-mode'] = "cors";
        headers['sec-fetch-site'] = "same-origin";
        headers['Referer'] = "https://myseller.taobao.com/home.htm/sucai-tu/home";
        headers['Origin'] = "https://myseller.taobao.com";
        headers['Host'] = "stream-upload.taobao.com";
        headers['x-requested-with'] = "XMLHttpRequest";
        log.info("uploadFileByFileApi headers ", headers);
        form.append('file', fs.createReadStream(filePath), path.basename(filePath));
        // 发送 POST 请求
        let attempt = 0; // 当前尝试次数
        let response; // 响应对象
        const url = "https://stream-upload.taobao.com/api/upload.api?_input_charset=utf-8&appkey=tu&folderId=0&picCompress=true&watermark=false";   
        while (attempt < MAX_RETRIES) {
            try {
                // 发送 POST 请求
                response = await axios.post(url, form, {
                    maxRedirects: 0,
                    headers: headers,
                    timeout: 5000,
                });
                break; // 如果请求成功，跳出重试循环
            } catch (error) {
                attempt++;
                if (attempt >= MAX_RETRIES) {
                    log.error("Upload failed after retries: ", error);
                    throw error; // 超过最大重试次数，抛出错误
                }
                log.warn(`Retrying upload... Attempt ${attempt}`);
            }
        }
        if(!response){
            return undefined;
        }
        const data = await response.data;
        if(typeof(data) == 'string'){
            log.warn("MbFileUploadMonitor getResponseData error ", data);
            continue;
        }
        if('ret' in data){
            const ret = data.ret;
            if(Array.isArray(ret)){
                const retCode = ret[0];
                if(retCode == 'FAIL_SYS_USER_VALIDATE'){
                    log.error("MbFileUploadMonitor getResponseData error ", data);
                    const validateData = data.data;
                    let validateParams : { [key: string]: any } | undefined =  undefined;
                    if('dialogSize' in validateData){
                        validateParams = {}
                        validateParams.dialogSize = validateData.dialogSize;
                    }
                    if('attributes' in validateData){
                        if(!validateParams){
                            validateParams = {};
                        }
                        validateParams.attributes = validateData.attributes;
                    }
                    return {
                        validateUrl : validateData.url,
                        validateParams : validateParams
                    };
                }
            }
        }
        if(!data || data.success == false){
            log.warn("MbFileUploadMonitor getResponseData error ", data);
            continue;
        }
        if('rgv587_flag' in data && data.rgv587_flag == 'sm'){
            return {
                validateUrl : data.url,
                validateParams : {}
            }
        }
        const fileData : FileData = data.object;
        if(!fileData){
            log.error("MbFileUploadMonitor not success ", data);
            return undefined;
        }
        const doorFileRecord = await saveDoorFileRecordByResult(source, "IMAGE", resourceId, fileData);
        const fileName = doorFileRecord.fileName;
        if(!fileName){
            continue;
        }
        const indexOf = fileName.indexOf(".");
        let fileNameKey = fileName;
        if(indexOf >= 0){
            fileNameKey = fileName.substring(0, indexOf);
        }
        const fileInfo = skuFileNames[fileNameKey];
        await uploadFileCallBack(doorFileRecord, fileInfo.sortId, skuItemId);
    }
    return undefined;
}

async function uploadFileCallBack(doorFileRecord: DoorFileRecord, sortId : number, skuItemId : string): Promise<void> {
    let fileName = doorFileRecord.fileName;
    if(!fileName){
        return;
    }
    const skuFile = new SkuFile(undefined, doorFileRecord.id, doorFileRecord.fileType, sortId, skuItemId);
    await saveSkuFile(skuFile);
}


export async function saveDoorFileRecordByResult(source : string, fileType : string, resourceId : number, data : FileData){
    const fileId = data.fileId;
    let fileName = data.fileName;
    const url = data.url;
    const fileKey = getFileKey(fileName);
    const indexOf = fileName.indexOf(".");
    if(indexOf >= 0){
        fileName = fileName.substring(0, indexOf);
    }
    const pix = data.pix;
    const doorFileRecord = new DoorFileRecord(undefined, source, fileId, resourceId, fileType, fileName, url, Number(data.size), data.folderId, fileKey, pix);
    return await saveDoorFileRecord(doorFileRecord);
}   
