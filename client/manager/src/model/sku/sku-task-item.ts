export enum SkuTaskItemStatus {
  PENDING = 'pending', // 待发布
  SUCCESS = 'success', // 成功
  FAILED = 'failed', // 失败
  CANCELLED = 'cancel', // 取消
  Existence = 'existence' // 已存在
}

export const STATUS_COLORS: Record<string, 'warning' | 'processing' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  success: 'success',
  failed: 'error',
  cancel: 'default',
  existence: 'default'
}

export const STATUS_LABELS: Record<string, string> = {
  pending: '待发布',
  success: '成功',
  failed: '失败',
  cancel: '取消',
  existence: '已存在'
}

export class SkuTaskItemPageReq {
  shopName: string
  skuName: string
  status: string
  current: number
  pageSize: number

  constructor(shopName: string, skuName: string, status: string, current: number, pageSize: number) {
    this.shopName = shopName
    this.skuName = skuName
    this.status = status
    this.current = current
    this.pageSize = pageSize
  }
}

export class SkuTaskItemPageResp {
  id: number
  taskId: number
  sourceSkuId: string
  resourceAccount: string
  shopName: string
  skuName: string
  publishTime: string
  status: string
  skuUrl: string
  publishSkuId: string

  constructor(
    id: number,
    taskId: number,
    sourceSkuId: string,
    resourceAccount: string,
    shopName: string,
    skuName: string,
    publishTime: string,
    status: string,
    skuUrl: string,
    publishSkuId: string
  ) {
    this.id = id
    this.taskId = taskId
    this.sourceSkuId = sourceSkuId
    this.resourceAccount = resourceAccount
    this.shopName = shopName
    this.skuName = skuName
    this.publishTime = publishTime
    this.status = status
    this.skuUrl = skuUrl
    this.publishSkuId = publishSkuId
  }
}

export class SkuTaskItemStepResp {
  id: number
  stepKey: string
  taskId: number
  status: string
  code: string
  groupCode: string
  validateUrl: string
  resourceId: number
  needNextSkip: boolean
  message: string

  constructor(
    id: number,
    stepKey: string,
    taskId: number,
    status: string,
    code: string,
    groupCode: string,
    validateUrl: string,
    resourceId: number,
    needNextSkip: boolean,
    message: string
  ) {
    this.id = id
    this.stepKey = stepKey
    this.taskId = taskId
    this.status = status
    this.code = code
    this.groupCode = groupCode
    this.validateUrl = validateUrl
    this.resourceId = resourceId
    this.needNextSkip = needNextSkip
    this.message = message
  }
}
