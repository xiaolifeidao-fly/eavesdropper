import { LabelValue } from '@model/base/base'
import { AddSkuTaskItemReq, SkuTaskItem } from '@model/sku/sku-task-item'

export enum SkuTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  DONE = 'done',
  ERROR = 'failed',
  STOP = 'stop'
}

export class SkuTask {
  constructor(
    public id: number,
    public status: string,
    public count: number,
    public publishResourceId: number,
    public source: string,
    public skuPublishConfig?: SkuPublishConfig,
    public items?: SkuTaskItem[],
  ) {
    this.id = id
    this.status = status
    this.count = count
    this.publishResourceId = publishResourceId
    this.skuPublishConfig = skuPublishConfig
    this.items = items
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
    public status: string,
    public remark?: string
  ) {
    this.taskId = taskId
    this.totalNum = totalNum
    this.successNum = successNum
    this.errorNum = errorNum
    this.status = status
    this.remark = remark
  }
}

export class AddSkuTaskReq {
  constructor(
    public count: number,
    public publishResourceId: number,
    public source: string,
    public remark?: string,
    public priceRange?: PriceRangeConfig[],
    public items?: AddSkuTaskItemReq[],
  ) {
    this.count = count
    this.publishResourceId = publishResourceId
    this.source = source
    this.remark = remark
    this.priceRange = priceRange
    this.items = items
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
export class SkuTaskStep {
  constructor(
    public id: number|undefined,
    public stepKey: string,
    public resourceId: number,
    public code: string,
    public message: string|undefined,
    public status: string|undefined,
    public groupCode: string,
    public validateUrl: string | undefined = undefined,
    public needNextSkip: boolean = false
  ) {
    this.id = id
    this.stepKey = stepKey
    this.resourceId = resourceId
    this.code = code
    this.message = message
    this.status = status
    this.groupCode = groupCode
    this.validateUrl = validateUrl
    this.needNextSkip = needNextSkip
  }
}

export class SkuTaskPageReq {
  constructor(
    public current: number,
    public pageSize: number,
    public resourceId?: number,
    public source?: string
  ) {
    this.current = current
    this.pageSize = pageSize
    this.resourceId = resourceId
    this.source = source
  }
}

export class SkuTaskPageResp {
  constructor(
    public id: number,
    public resourceId: number,
    public resourceAccount: string,
    public status: string,
    public statusLableValue: LabelValue,
    public source: string,
    public sourceLableValue: LabelValue,
    public count: number,
    public createdBy: string,
    public createdAt: string,
    public shopName: string,
    public successCount: number,
    public failedCount: number,
    public cancelCount: number,
    public existenceCount: number,
  ) {
    this.id = id
    this.resourceId = resourceId
    this.resourceAccount = resourceAccount
    this.status = status
    this.statusLableValue = statusLableValue
    this.source = source
    this.sourceLableValue = sourceLableValue
    this.count = count
    this.createdBy = createdBy
    this.createdAt = createdAt
    this.shopName = shopName
    this.successCount = successCount
    this.failedCount = failedCount
    this.cancelCount = cancelCount
    this.existenceCount = existenceCount
  }
}

export const STEP_INIT = "INIT"
export const STEP_PENDING = "PENDING"
export const STEP_DONE = "DONE"
export const STEP_ROLLBACK = "ROLLBACK"
export const STEP_ERROR = "ERROR"