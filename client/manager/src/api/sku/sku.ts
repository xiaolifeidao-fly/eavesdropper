import { instance } from '@/utils/axios'
import { plainToClass } from 'class-transformer'

import { SkuTaskStepLogResp } from '@/model/sku/sku'

export const getSkuTaskStepLog = async (skuTaskStepId: number) => {
  const result = await instance.get(`/sku/task/steps/log/${skuTaskStepId}`)
  return plainToClass(SkuTaskStepLogResp, result)
}
