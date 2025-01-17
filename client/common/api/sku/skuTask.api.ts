import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { AddSkuTaskReq, UpdateSkuTaskReq } from '@model/sku/skuTask'

// 添加任务
export const addSkuTask = async (req: AddSkuTaskReq) => {
  const result = await instance.post(`/sku/task`, req)
  return plainToClass(Number, result)
}

// 更新任务
export const updateSkuTask = async (taskId: number, req: UpdateSkuTaskReq) => {
  const result = await instance.put(`/sku/task/${taskId}`, req)
  return plainToClass(String, result)
}
