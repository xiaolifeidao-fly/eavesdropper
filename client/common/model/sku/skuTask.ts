export enum SkuTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  DONE = 'done',
  ERROR = 'failed'
}

export class SkuTask {
  constructor(
    public id: number,
    public status: string,
    public count: number,
    public publishResourceId: number
  ) {
    this.id = id
    this.status = status
    this.count = count
    this.publishResourceId = publishResourceId
  }
}

export class SkuPublishConfig {
  constructor(
    public priceRate: string,
  ) {
    this.priceRate = priceRate
  }
}

export class SkuPublishStatitic {
  constructor(
    public taskId: number,
    public totalNum: number,
    public successNum: number,
    public errorNum: number,
    public status: string
  ) {
    this.taskId = taskId
    this.totalNum = totalNum
    this.successNum = successNum
    this.errorNum = errorNum
    this.status = status
  }
}

export class AddSkuTaskReq {
  constructor(
    public count: number,
    public publishResourceId: number,
    public priceRate: string,
    public remark?: string
  ) {
    this.count = count
    this.publishResourceId = publishResourceId
    this.remark = remark
    this.priceRate = priceRate
  }
}

export class UpdateSkuTaskReq {
  constructor(
    public status: string,
    public remark?: string,
    public items?: AddSkuTaskItemReq[]
  ) {
    this.status = status
    this.remark = remark
    this.items = items
  }
}

export enum SkuTaskItemStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCEL = 'cancel'
}

export class AddSkuTaskItemReq {
  constructor(
    public taskId: number,
    public url: string,
    public status: string,
    public remark?: string
  ) {
    this.taskId = taskId
    this.url = url
    this.status = status
    this.remark = remark
  }
}
