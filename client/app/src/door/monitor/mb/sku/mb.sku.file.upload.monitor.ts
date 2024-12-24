import { DoorFileRecord } from "@model/door/door";
import { MbFileUploadMonitor } from "../file/file";
import { SkuFile } from "@model/sku/sku.file";
import { saveSkuFile } from "@api/sku/sku.file";
export class SkuFileName { 

    fileName : string;
    sortId : number;
    fileType : string;

    constructor(fileName: string, sortId: number, fileType: string) {
        this.fileName = fileName;
        this.sortId = sortId;
        this.fileType = fileType;
    }
}

export class MbSkuFileUploadMonitor extends MbFileUploadMonitor {

    skuId: number;

    skuFileNames: { [key: string]: SkuFileName };

    constructor(resourceId: number, skuId: number, skuFileNames: { [key: string]: SkuFileName }) {
        super(resourceId);
        this.skuId = skuId;
        this.skuFileNames = skuFileNames;
    }

    async uploadFileCallBack(doorFileRecord: DoorFileRecord): Promise<void> {
        let fileName = doorFileRecord.fileName;
        if(!fileName){
            return;
        }
        const skuFileName = this.skuFileNames[fileName];
        if(!skuFileName){
            return;
        }
        const skuFile = new SkuFile(undefined, this.skuId, doorFileRecord.id, doorFileRecord.fileType, skuFileName.sortId);
        skuFile.sortId = skuFileName.sortId;
        await saveSkuFile(skuFile);
    }

}
