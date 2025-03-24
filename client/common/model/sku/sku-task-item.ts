import { LabelValue } from '@model/base/base'

export class SkuTaskItem {
  constructor(
    public id?: number,
    public taskId?: number,
    public url?: string,
    public status?: string,
    public source?: string,
    public remark?: string,
    public skuId?: number,
    public sourceSkuId?: string,
    public title?: string,
    public name?: string,
  ) {
    this.id = id
    this.taskId = taskId
    this.url = url
    this.status = status
    this.source = source
    this.remark = remark
    this.skuId = skuId
    this.sourceSkuId = sourceSkuId
    this.title = title
    this.name = name
  }
}

export enum SkuTaskItemStatus {
  PENDING = 'pending',
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
    public remark?: string,
    public skuId?: number,
    public id?: number,
    public sourceSkuId?: string,
    public title?: string,
  ) {
    this.taskId = taskId
    this.url = url
    this.status = status
    this.source = source
    this.remark = remark
    this.skuId = skuId
    this.id = id
    this.sourceSkuId = sourceSkuId
    this.title = title
  }
}
export class SkuTaskItemResp {
  constructor(
    public id: number,
    public taskId: number,
    public url: string,
    public status: string,
    public remark: string,
    public skuId: number,
    public name: string,
    public sourceSkuId: string,
    public source: string,
    public sourceLableValue: LabelValue,
    public createdAt: string,
    public newSkuUrl: string,
    public title: string
  ) {
    this.id = id
    this.taskId = taskId
    this.url = url
    this.status = status
    this.remark = remark
    this.skuId = skuId
    this.name = name
    this.sourceSkuId = sourceSkuId
    this.source = source
    this.sourceLableValue = sourceLableValue
    this.createdAt = createdAt
    this.newSkuUrl = newSkuUrl
    this.title = title
  }
}
