import { plainToClass } from 'class-transformer'

import { getData, getDataList, instance } from '@utils/axios'
import { AddSkuTaskReq, SkuTaskStep, UpdateSkuTaskReq } from '@model/sku/skuTask'

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

// 获取任务步骤
export const getSkuTaskSteps = async (stepKey: string, resourceId: number, groupCode: string) => {
  return await getDataList(SkuTaskStep, `/sku/task/steps/${resourceId}/${groupCode}/${stepKey}`)
}

// 保存任务步骤
export const saveSkuTaskStep = async (req: SkuTaskStep) => {
  return instance.post('/sku/task/steps/save', req)
}

export const initSkuStep = async (stepKey: string, resourceId: number, groupCode: string) => {
  return instance.post(`/sku/task/steps/${resourceId}/${groupCode}/${stepKey}/init`, {})
}
