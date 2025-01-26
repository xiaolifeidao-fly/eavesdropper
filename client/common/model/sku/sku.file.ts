
export class SkuFile {

    id : number|undefined;
    fileId : number|undefined;
    type : string|undefined;
    sortId : number|undefined;
    skuItemId : string|undefined;
    constructor(id? : number, fileId? : number, type? : string, sortId? : number, skuItemId? : string) {
        this.id = id;
        this.fileId = fileId;
        this.type = type;
        this.sortId = sortId;
        this.skuItemId = skuItemId;
    }

}

export class SkuFileDetail extends SkuFile {
    itemFileId : string|undefined;
    fileType : string|undefined;
    fileSize : number|undefined;
    fileUrl : string|undefined;
    fileName : string|undefined;
    constructor(id? : number, fileId? : number, type? : string, sortId? : number, itemFileId? : string, fileType? : string, fileUrl? : string, fileName? : string, fileSize? : number, skuItemId? : string) {
        super(id, fileId, type, sortId, skuItemId);
        this.itemFileId = itemFileId;
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;
    }
}