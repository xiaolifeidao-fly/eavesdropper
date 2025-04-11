import { DoorEntity } from "@src/door/entity";
import { Request, Response } from "playwright";
import { MbMonitorResponse } from "../mb.monitor";
import log from "electron-log";
import { saveDoorFileRecord } from "@api/door/file.api";
import { DoorFileRecord } from "@model/door/door";
import { getStringHash } from "@utils/crypto.util";
import path from "path";
export class FileData {
    fileId: string;
    folderId: string;
    pix: string;
    fileName: string;
    size: string;
    url: string;

    constructor(data: any){
        this.fileId = data.fileId;
        this.folderId = data.folderId;
        this.pix = data.pix;
        this.fileName = data.fileName;
        this.size = data.size;
        this.url = data.url;
    }
}


export function getFileKey(fileName: string){
    let indexOf = fileName.indexOf(".");
    if(indexOf >= 0){
        fileName = fileName.substring(0, indexOf);
    }
    return getStringHash(fileName);
}

export class FileInfo { 

    fileName : string;
    sortId : number;
    fileType : string;
    filePath : string;

    constructor(fileName: string, sortId: number, fileType: string, filePath: string) {
        this.fileName = fileName;
        this.sortId = sortId;
        this.fileType = fileType;
        this.filePath = filePath;
    }
}

export class MbFileQueryMonitor extends MbMonitorResponse<FileData> {

    getApiName(): string {
        return "mtop.taobao.picturecenter.console.file.query";
    }

    getKey(): string {
        return "file.query.api";
    }

    public needHeaderData(): boolean {
        return true;
    }

}

export class MbFileUploadMonitor extends MbMonitorResponse<FileData> {

    resourceId: number;

    fileInfos: { [key: string]: FileInfo };

    constructor(resourceId: number, fileInfos: { [key: string]: FileInfo }) {
        super();
        this.resourceId = resourceId;
        this.fileInfos = fileInfos;
    }

    getApiName(): string {
        return "/api/upload.api";
    }

    getKey(): string {
        return "upload";
    }

    public async getResponseData(response: Response): Promise<DoorEntity<FileData>> {
        try{
            const data = await response.json();
            if(!data || data.success == false){
                console.log("MbFileUploadMonitor getResponseData error ", data);
                return new DoorEntity<FileData>(false, {} as FileData);
            }
            return new DoorEntity<FileData>(true, data.object as FileData);
        }catch(e){
            log.error("MbSkuInfoMonitor getResponseData error", e);
            return new DoorEntity<FileData>(false, {} as FileData);
        }
    }

    async doCallback(doorEntity: DoorEntity<FileData>, request?: Request | undefined, response?: Response | undefined): Promise<void> {
        if(!doorEntity.code){
            return;
        }
        const data  = doorEntity.data;
        const fileId = data.fileId;
        let fileName = data.fileName;
        let indexOf = fileName.indexOf(".");
        if(indexOf >= 0){
            fileName = fileName.substring(0, indexOf);
        }
        const fileInfo = this.fileInfos[fileName];
        if(!fileInfo){
            log.warn("fileInfo not found ", fileName);
            return;
        }
        const url = data.url;
        const pix = data.pix;
        const fileKey = getFileKey(fileName);
        const doorFileRecord = new DoorFileRecord(undefined, this.getType(), fileId, this.resourceId, "IMAGE", fileName, url, Number(data.size), data.folderId, fileKey,pix);
        const result = await saveDoorFileRecord(doorFileRecord);
        await this.uploadFileCallBack(result);
    }

    async uploadFileCallBack(doorFileRecord: DoorFileRecord){

    }

}