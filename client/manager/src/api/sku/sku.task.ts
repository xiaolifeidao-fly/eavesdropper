import { BasePageResp, LabelValue } from "@/common/base"
import { instance } from "@/utils/axios"
import { plainToClass } from "class-transformer"

export class SkuTaskPageReq {
    constructor(
      public current: number,
      public pageSize: number,
      public shopName?: string,
      public skuName?: string
    ) {
      this.current = current
      this.pageSize = pageSize
      this.shopName = shopName
      this.skuName = skuName
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
      public expirationDate: string,
      public resourceStatus: string,
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
      this.expirationDate = expirationDate
      this.resourceStatus = resourceStatus
    }
  }
  
  export const STEP_INIT = "INIT"
  export const STEP_PENDING = "PENDING"
  export const STEP_DONE = "DONE"
  export const STEP_ROLLBACK = "ROLLBACK"
  export const STEP_ERROR = "ERROR"

// 分页获取商品任务
export const getSkuTaskPage = async (req: SkuTaskPageReq) => {
    const result = await instance.get(`/sku/task/page`, { params: req })
    return plainToClass(BasePageResp<SkuTaskPageResp>, result)
}
  