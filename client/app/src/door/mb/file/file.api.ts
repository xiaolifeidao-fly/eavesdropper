import { FileData, FileInfo, getFileKey } from "@src/door/monitor/mb/file/file";

import { getSkuFiles, saveSkuFile } from "@api/sku/sku.file";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from 'form-data';
import { DoorFileRecord } from "@model/door/door";
import { SkuFile } from "@model/sku/sku.file";
import { getUnUploadFile } from "./file";
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

export async function uploadByFileApi(resourceId : number, skuItemId : string, skuFileNames: { [key: string]: FileInfo } = {}) {
    const fileQueryMonitor = new MbFileQueryMonitor();
    const paths = getFilePaths(skuFileNames);
    const unUploadFiles = await getUnUploadFile(fileQueryMonitor.getType(), resourceId, paths);
    if(unUploadFiles.length === 0){
        const skuFiles = await getSkuFiles(skuItemId, resourceId);
        return {
            skuFiles : skuFiles,
            validateUrl : undefined,
            header : undefined
        };
    }
    const mbEngine = new MbEngine(resourceId);
    try{
        const page = await mbEngine.init();
        if(!page){
            return {
                skuFiles : [],
                validateUrl : undefined,
                header : undefined
            };
        }
        mbEngine.addMonitor(fileQueryMonitor);
        const result = await mbEngine.openWaitMonitor(page, "https://qn.taobao.com/home.htm/sucai-tu/home", fileQueryMonitor);
        if(!result.code){
            return {
                skuFiles : [],
                validateUrl : undefined,
                header : undefined
            };
        }
        const headerData = result.getHeaderData();
        const uploadResult = await uploadFileByFileApi(fileQueryMonitor.getType(), resourceId, skuItemId, unUploadFiles, skuFileNames, headerData);
        const skuFiles = await getSkuFiles(skuItemId, resourceId);
        return {
            skuFiles : skuFiles,
            validateUrl : uploadResult,
            header : headerData
        };
    }finally{
        await mbEngine.closePage();
    }
}

async function uploadFileByFileApi(source : string, resourceId : number, skuItemId : string, unUploadFiles: string[], skuFileNames: { [key: string]: FileInfo } = {}, headerData : { [key: string]: string; }){
  
    //Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.6778.33 Safari/537.36
    for(let filePath of unUploadFiles){
        const form = new FormData();
        //合并headerData
        const headers = {
            ...headerData,
            ...form.getHeaders(),
            ...{
                "Origin" : "https://qn.taobao.com",
                "Connection" : "keep-alive",
                "Sec-Fetch-Dest" : "empty",
                "Sec-Fetch-Mode" : "cors",
                "Sec-Fetch-Site" : "same-site"
            }
        }
        form.append('file', fs.createReadStream(filePath), path.basename(filePath));
        // 发送 POST 请求
        const response = await axios.post("https://stream-upload.taobao.com/api/upload.api?_input_charset=utf-8&appkey=tu&folderId=0&picCompress=true&watermark=false", form, {
             maxRedirects: 0,
             headers: headers,
        });
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
                    return data.data.url;
                }
            }
        }
        if(!data || data.success == false){
            log.warn("MbFileUploadMonitor getResponseData error ", data);
            continue;
        }
        log.info("MbFileUploadMonitor getResponseData success ", data);
        const fileData : FileData = data.object;
        const doorFileRecord = await saveDoorFileRecordByResult(source, "IMAGE", resourceId, fileData);
        const fileName = doorFileRecord.fileName;
        if(!fileName){
            continue;
        }
        const fileInfo = skuFileNames[fileName];
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
    let indexOf = fileName.indexOf(".");
    if(indexOf >= 0){
        fileName = fileName.substring(0, indexOf);
    }
    const url = data.url;
    const fileKey = getFileKey(fileName);
    const doorFileRecord = new DoorFileRecord(undefined, source, fileId, resourceId, fileType, fileName, url, Number(data.size), data.folderId, fileKey);
    return await saveDoorFileRecord(doorFileRecord);
}   
