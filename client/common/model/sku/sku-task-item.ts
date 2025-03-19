import { LabelValue } from '@model/base/base'

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
    public newSkuUrl: string
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
  }
}
