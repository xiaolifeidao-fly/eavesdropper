
export class Sku {

    id : number|undefined;
    name : string|undefined;
    sourceSkuId : string|undefined;
    taskId : number|undefined;
    publishResourceId : number|undefined;
    status : string|undefined;

    constructor(id? : number, name? : string, sourceSkuId? : string, taskId? : number, publishResourceId? : number, status? : string){
        this.id = id;
        this.name = name;
        this.sourceSkuId = sourceSkuId;
        this.taskId = taskId;
        this.publishResourceId = publishResourceId;
        this.status = status;
    }
}

export class SkuPublishStatitic {

    taskId : number|undefined;
    totalNum : number|undefined;
    successNum : number|undefined;
    errorNum : number|undefined;

    constructor(taskId? : number, totalNum? : number, successNum? : number, errorNum? : number) {
        this.taskId = taskId;
        this.totalNum = totalNum;
        this.successNum = successNum;
        this.errorNum = errorNum;
    }

}

export class AddSkuReq {
    name : string|undefined; // 商品名称
    sourceSkuId : string|undefined; // 源商品id
    taskId : number|undefined; // 任务id
    status : string|undefined; // 状态
    publishResourceId : number|undefined; // 发布资源id

    constructor(name? : string, sourceSkuId? : string, taskId? : number, status? : string, publishResourceId? : number) {
        this.name = name;
        this.sourceSkuId = sourceSkuId;
        this.taskId = taskId;
        this.status = status;
        this.publishResourceId = publishResourceId;
    }
}