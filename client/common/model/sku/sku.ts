export enum SkuStatus {
  SUCCESS = "success",
  PENDING = "pending",
  ERROR = "error",
}

export class Sku {
  constructor(
    public id?: number,
    public name?: string,
    public sourceSkuId?: string,
    public taskId?: number,
    public publishResourceId?: number,
    public status?: string,
    public url?: string,
    public publishTime?: string,
    public publishSkuId?: string,
  ) {
    this.id = id
    this.name = name
    this.sourceSkuId = sourceSkuId
    this.taskId = taskId
    this.publishResourceId = publishResourceId
    this.status = status
    this.url = url
    this.publishTime = publishTime
    this.publishSkuId = publishSkuId
  }
}

export class SkuPublishResult {
  constructor(
    public taskId: number,
    public publishResourceId: number,
    public status: string,
    public key?: number,
    public id?: number,
    public name?: string,
    public url?: string,
    public sourceSkuId?: string,
    public publishSkuId?: string,
    public publishTime?: string,
    public remark?: string,
  ) {
    this.taskId = taskId
    this.publishResourceId = publishResourceId
    this.status = status
    this.key = key
    this.id = id
    this.name = name
    this.url = url
    this.sourceSkuId = sourceSkuId
    this.publishSkuId = publishSkuId
    this.publishTime = publishTime
    this.remark = remark
  }
}

export class AddSkuReq {
  constructor(
    public name?: string, // 商品名称
    public sourceSkuId?: string, // 源商品id
    public taskId?: number, // 任务id
    public status?: string, // 状态
    public publishResourceId?: number, // 发布资源id
    public url?: string, // 商品链接
    public publishTime?: string, // 发布时间
    public publishSkuId?: string, // 发布商品id
    public source?: string, // 来源
  ) {
    this.name = name
    this.sourceSkuId = sourceSkuId
    this.taskId = taskId
    this.status = status
    this.publishResourceId = publishResourceId
    this.url = url
    this.publishTime = publishTime
    this.publishSkuId = publishSkuId
    this.source = source
  }
}

export class CheckSkuExistenceReq {
  constructor(
    public sourceSkuId: string,
    public publishResourceId: number,
  ) {
    this.sourceSkuId = sourceSkuId
    this.publishResourceId = publishResourceId
  }
}

export class SkuPageReq {
  constructor(
    public current: number,
    public pageSize: number,
    public shopName?: string,
    public skuName?: string
  ) {
    this.shopName = shopName
    this.skuName = skuName
    this.current = current
    this.pageSize = pageSize
  }
}

export class SkuPageResp {
  constructor(
    public id: number,
    public resourceAccount: string,
    public shopName: string,
    public skuName: string,
    public status: string,
    public publishTime: string,
    public createdAt: string,
    public url: string,
    public publishUrl: string,
    public source: string,
  ) {
    this.id = id
    this.resourceAccount = resourceAccount
    this.shopName = shopName
    this.skuName = skuName
    this.status = status
    this.publishTime = publishTime
    this.createdAt = createdAt
    this.url = url
    this.publishUrl = publishUrl
    this.source = source
  }
}
