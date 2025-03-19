import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { SkuTaskItemResp } from '@model/sku/sku-task-item'

export const getSkuTaskItemByTaskId = async (taskId: number) => {
  const result = await instance.get(`/sku/task/${taskId}/item`)
  return plainToClass(Array<SkuTaskItemResp>, result)
}