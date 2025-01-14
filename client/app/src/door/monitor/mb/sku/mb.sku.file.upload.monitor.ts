import { DoorFileRecord } from "@model/door/door";
import { FileInfo, MbFileUploadMonitor } from "../file/file";
import { SkuFile } from "@model/sku/sku.file";
import { saveSkuFile } from "@api/sku/sku.file";

export class MbSkuFileUploadMonitor extends MbFileUploadMonitor {

    skuId: number;


    constructor(resourceId: number, skuId: number, fileInfos: { [key: string]: FileInfo }) {
        super(resourceId, fileInfos);
        this.skuId = skuId;
    }

    async uploadFileCallBack(doorFileRecord: DoorFileRecord): Promise<void> {
        let fileName = doorFileRecord.fileName;
        if(!fileName){
            return;
        }
        const fileInfo = this.fileInfos[fileName];
        if(!fileInfo){  
            return;
        }
        const skuFile = new SkuFile(undefined, this.skuId, doorFileRecord.id, doorFileRecord.fileType, fileInfo.sortId);
        skuFile.sortId = fileInfo.sortId;
        await saveSkuFile(skuFile);
    }

}
