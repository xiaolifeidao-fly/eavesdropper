
export class SkuFile {

    id : number|undefined;
    skuId : number|undefined;
    fileId : number|undefined;
    type : string|undefined;
    sortId : number|undefined;
    constructor(id? : number, skuId? : number, fileId? : number, type? : string, sortId? : number) {
        this.id = id;
        this.skuId = skuId;
        this.fileId = fileId;
            this.type = type;
        this.sortId = sortId;
    }

}

export class SkuFileDetail extends SkuFile {
    fileType : string|undefined;
    fileSize : number|undefined;
    fileUrl : string|undefined;
    fileName : string|undefined;
    constructor(id? : number, skuId? : number, fileId? : number, type? : string, sortId? : number, fileType? : string, fileUrl? : string, fileName? : string, fileSize? : number) {
        super(id, skuId, fileId, type, sortId);
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;
    }
}