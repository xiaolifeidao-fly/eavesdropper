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
    public publishResourceId: number,
    public source: string,
    public skuPublishConfig?: SkuPublishConfig,
  ) {
    this.id = id
    this.status = status
    this.count = count
    this.publishResourceId = publishResourceId
    this.skuPublishConfig = skuPublishConfig
  }
}

export class PriceRangeConfig {
  constructor(
    public minPrice: number,
    public maxPrice: number,
    public priceMultiplier: number,
    public fixedAddition: number,
    public roundTo: string
  ) {
    this.minPrice = minPrice // 最小价格
    this.maxPrice = maxPrice // 最大价格
    this.priceMultiplier = priceMultiplier // 价格乘以的系数
    this.fixedAddition = fixedAddition // 加上固定值
    this.roundTo = roundTo // 保留单位,元(yuan),角(jiao),分(fen)
  }
}

export class SkuPublishConfig {
  constructor(
    public priceRate?: PriceRangeConfig[],
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
    public source: string,
    public remark?: string,
    public priceRange?: PriceRangeConfig[],
  ) {
    this.count = count
    this.publishResourceId = publishResourceId
    this.source = source
    this.remark = remark
    this.priceRange = priceRange
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
  CANCEL = 'cancel',
  EXISTENCE = 'existence'
}

export class AddSkuTaskItemReq {
  constructor(
    public taskId: number,
    public url: string,
    public status: string,
    public source: string,
    public remark?: string
  ) {
    this.taskId = taskId
    this.url = url
    this.status = status
    this.source = source;
    this.remark = remark
  }
}


export class SkuTaskStep {
  constructor(
    public id: number|undefined,
    public stepKey: string,
    public resourceId: number,
    public code: string,
    public message: string|undefined,
    public status: string|undefined,
    public groupCode: string,
    public validateUrl: string | undefined = undefined
  ) {
    this.id = id
    this.stepKey = stepKey
    this.resourceId = resourceId
    this.code = code
    this.message = message
    this.status = status
    this.groupCode = groupCode
    this.validateUrl = validateUrl
  }
}
export const STEP_INIT = "INIT"
export const STEP_PENDING = "PENDING"
export const STEP_DONE = "DONE"
export const STEP_ERROR = "ERROR"