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

function getFilePaths(skuFileNames: { [key: string]: FileInfo } = {}){
    const filePaths = [];
    for(let key in skuFileNames){
        const fileInfo = skuFileNames[key];
        filePaths.push(fileInfo.filePath);
    }
    return filePaths;
}

export async function uploadByFileApi(resourceId : number, skuItemId : string, skuFileNames: { [key: string]: FileInfo } = {}){
    const fileQueryMonitor = new MbFileQueryMonitor();
    const paths = getFilePaths(skuFileNames);
    const unUploadFiles = await getUnUploadFile(fileQueryMonitor.getType(), resourceId, paths);
    if(unUploadFiles.length === 0){
        const skuFiles = await getSkuFiles(skuItemId);
        return skuFiles;
    }
    const mbEngine = new MbEngine(resourceId);
    try{
        const page = await mbEngine.init();
        if(!page){
            return [];
        }
        mbEngine.addMonitor(fileQueryMonitor);
        const result = await mbEngine.openWaitMonitor(page, "https://qn.taobao.com/home.htm/sucai-tu/home", fileQueryMonitor);
        if(!result.code){
            return [];
        }
        const headerData = result.getHeaderData();
        await uploadFileByFileApi(fileQueryMonitor.getType(), resourceId, skuItemId, unUploadFiles, skuFileNames, headerData);
        const skuFiles = await getSkuFiles(skuItemId);
        return skuFiles;
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
        }
        // 读取图片文件并添加到 FormData 中
        form.append('file', fs.createReadStream(filePath), path.basename(filePath));
        // 发送 POST 请求
        const response = await axios.post("https://stream-upload.taobao.com/api/upload.api?_input_charset=utf-8&appkey=tu&folderId=0&picCompress=true&watermark=false", form, {
             maxRedirects: 0,
             headers: headers,
        });
        const data = await response.data;
        if(typeof(data) == 'string'){
            console.log("MbFileUploadMonitor getResponseData error ", data);
            return;
        }
        if('ret' in data){
            console.log("MbFileUploadMonitor getResponseData error ", data);
            return;
        }
        if(!data || data.success == false){
            console.log("MbFileUploadMonitor getResponseData error ", data);
            continue;
        }
        const fileData : FileData = data.object;
        const doorFileRecord = await saveDoorFileRecordByResult(source, "IMAGE", resourceId, fileData);
        const fileName = doorFileRecord.fileName;
        if(!fileName){
            continue;
        }
        const fileInfo = skuFileNames[fileName];
        await uploadFileCallBack(doorFileRecord, fileInfo.sortId, skuItemId);
    }
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
