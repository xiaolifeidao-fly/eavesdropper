
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