import { DoorFileRecord } from "@model/door/door";
import { FileInfo, MbFileUploadMonitor } from "../file/file";
import { SkuFile } from "@model/sku/sku.file";
import { saveSkuFile } from "@api/sku/sku.file";

export class MbSkuFileUploadMonitor extends MbFileUploadMonitor {

    skuItemId: string;


    constructor(resourceId: number, skuItemId: string, fileInfos: { [key: string]: FileInfo }) {
        super(resourceId, fileInfos);
        this.skuItemId = skuItemId;
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
        const skuFile = new SkuFile(undefined, doorFileRecord.id, doorFileRecord.fileType, fileInfo.sortId, this.skuItemId);
        skuFile.sortId = fileInfo.sortId;
        await saveSkuFile(skuFile);
    }

}
