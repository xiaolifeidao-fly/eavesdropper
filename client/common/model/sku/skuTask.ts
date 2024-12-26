export enum SkuTaskStatus {
  PENDING = "pending",
  DONE = "done",
  ERROR = "error",
}

export class SkuTask {
  constructor(
    public id?: number,
    public status?: string,
    public count?: number,
    public publishResourceId?: number
  ) {
    this.id = id
    this.status = status
    this.count = count
    this.publishResourceId = publishResourceId
  }
}

export class SkuPublishStatitic {
  constructor(
    public taskId?: number,
    public totalNum?: number,
    public successNum?: number,
    public errorNum?: number,
    public status?: string
  ) {
    this.taskId = taskId
    this.totalNum = totalNum
    this.successNum = successNum
    this.errorNum = errorNum
    this.status = status
  }
}

export class AddSkuTaskReq {
  constructor(public count: number, public publishResourceId: number) {
    this.count = count
    this.publishResourceId = publishResourceId
  }
}

export class UpdateSkuTaskReq {
  constructor(public progress: number, public status: string) {
    this.progress = progress
    this.status = status
  }
}
