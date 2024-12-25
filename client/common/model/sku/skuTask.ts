export class AddSkuTaskReq {
    count: number;
    publishResourceId: number;

    constructor(count: number, publishResourceId: number) {
        this.count = count;
        this.publishResourceId = publishResourceId;
    }
}

export class SkuTask {
    id: number;
    status: string;
    count: number;

    constructor(id: number, status: string, count: number) {
        this.id = id;
        this.status = status;
        this.count = count;
    }
}

export class UpdateSkuTaskReq {
    progress: number;
    status: string;

    constructor(progress: number, status: string) {
        this.progress = progress;
        this.status = status;
    }
}