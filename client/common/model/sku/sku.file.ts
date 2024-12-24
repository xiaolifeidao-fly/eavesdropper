
export class SkuFile {

    id : number;
    skuId : number;
    fileId : number;
    type : string;
    sortId : number;

    constructor(id? : number, skuId? : number, fileId? : number, type? : string, sortId? : number) {
        this.id = id;
        this.skuId = skuId;
        this.fileId = fileId;
        this.type = type;
        this.sortId = sortId;
    }

}