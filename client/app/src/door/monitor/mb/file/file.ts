import { DoorEntity } from "@src/door/entity";
import { Request, Response } from "playwright";
import { MbMonitorResponse } from "../mb.monitor";
// import log from "electron-log";
import { getDoorFileRecord, saveDoorFileRecord } from "@api/door/file.api";
import { DoorFileRecord } from "@model/door/door";
import { getStringHash } from "@utils/crypto.util";
export class FileData {
    fileId: string;
    folderId: string;
    pix: string;
    fileName: string;
    size: number;
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


export function getFileKey(filePath: string){
    const lastIndex = filePath.lastIndexOf("/");
    let fileKey = filePath;
    if(lastIndex != -1){
        fileKey = fileKey.substring(lastIndex + 1);
    }
    const suffixIndex = fileKey.indexOf(".");
    if(suffixIndex != -1){
        fileKey = fileKey.substring(0, suffixIndex);
    }
    return getStringHash(fileKey);
}

export class MbFileUploadMonitor extends MbMonitorResponse<FileData> {

    resourceId: number;

    constructor(resourceId: number) {
        super();
        this.resourceId = resourceId;
    }

    getApiName(): string {
        return "/api/upload.api";
    }

    getKey(): string {
        return "upload";
    }

    public async getResponseData(response: Response): Promise<any> {
        try{
            const data = await response.json();
            if(!data || data.success == false){
                return undefined;
            }
            return data.object;
        }catch(e){
            // log.error("MbSkuInfoMonitor getResponseData error", e);
            return undefined;
        }
    }

    async doCallback(doorEntity: DoorEntity<FileData>, request?: Request | undefined, response?: Response | undefined): Promise<void> {
        if(!doorEntity.code){
            return;
        }
        const data  = doorEntity.data;
        const fileId = data.fileId;
        const fileName = data.fileName;
        const url = data.url;
        const fileKey = getFileKey(fileName);
        const doorFileRecord = new DoorFileRecord(undefined, this.getType(), fileId, this.resourceId, "IMAGE", fileName, url, Number(data.size), data.folderId, fileKey);
        const result = await saveDoorFileRecord(doorFileRecord);
        await this.uploadFileCallBack(result);
    }

    async uploadFileCallBack(doorFileRecord: DoorFileRecord){

    }

}

export class MbFileQueryMonitor extends MbMonitorResponse<FileData> {

    getApiName(): string {
        return "mtop.taobao.picturecenter.console.file.query";
    }
    getKey(): string {
        return "fileQuery";
    }
}