
export class Sku {

    id : number|undefined;
    sourceSkuId : number|undefined;
    taskId : number|undefined;
    status : string|undefined;

    constructor(id? : number, sourceSkuId? : number, taskId? : number, status? : string){
        this.id = id;
        this.sourceSkuId = sourceSkuId;
        this.taskId = taskId;
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
    sourceSkuId : number; // 源商品id
    taskId : number; // 任务id
    status : string; // 状态
    publishResourceId : number; // 发布资源id

    constructor(sourceSkuId : number, taskId : number, status : string, publishResourceId : number) {
        this.sourceSkuId = sourceSkuId;
        this.taskId = taskId;
        this.status = status;
        this.publishResourceId = publishResourceId;
    }
}