import { BasePageResp, LabelValue } from '@/common/base'
import { instance } from '@/utils/axios'
import { plainToClass } from 'class-transformer'

import { SkuTaskItemPageReq, SkuTaskItemPageResp, SkuTaskItemStepResp } from '@/model/sku/sku-task-item'

export const STEP_INIT = 'INIT'
export const STEP_PENDING = 'PENDING'
export const STEP_DONE = 'DONE'
export const STEP_ROLLBACK = 'ROLLBACK'
export const STEP_ERROR = 'ERROR'

// 分页获取商品任务
export const getSkuTaskPage = async (req: SkuTaskItemPageReq) => {
  const result = await instance.get(`/sku/task/item/page`, { params: req })
  return plainToClass(BasePageResp<SkuTaskItemPageResp>, result)
}

// 获取商品任务项步骤
export const getSkuTaskItemStepByItemId = async (itemId: number) => {
  const result = await instance.get(`/sku/task/item/${itemId}/step`)
  return plainToClass(Array<SkuTaskItemStepResp>, result)
}
