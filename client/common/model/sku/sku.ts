
export class Sku {

    id : number;
    sourceSkuId : number;
    taskId : number;
    status : string;

    constructor(id? : number, sourceSkuId? : number, taskId? : number, status? : string){
        this.id = id;
        this.sourceSkuId = sourceSkuId;
        this.taskId = taskId;
        this.status = status;
    }
}

export class SkuPublishStatitic {

    taskId : number;
    totalNum : number;
    successNum : number;
    errorNum : number;

    constructor(taskId? : number, totalNum? : number, successNum? : number, errorNum? : number) {
        this.taskId = taskId;
        this.totalNum = totalNum;
        this.successNum = successNum;
        this.errorNum = errorNum;
    }

}