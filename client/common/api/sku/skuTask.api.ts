import { plainToClass } from 'class-transformer'

import { getData, getDataList, instance } from '@utils/axios'
import {
  AddSkuTaskReq,
  SkuTaskStep,
  UpdateSkuTaskReq,
  SkuTaskPageReq,
  SkuTaskPageResp,
  SkuTask,
  SkuTaskStepLog
} from '@model/sku/skuTask'
import { BasePageResp, LabelValue } from '@model/base/base'

// 添加任务
export const addSkuTask = async (req: AddSkuTaskReq) => {
  const result = await instance.post(`/sku/task`, req)
  return plainToClass(SkuTask, result)
}

// 更新任务
export const updateSkuTask = async (taskId: number, req: UpdateSkuTaskReq) => {
  const result = await instance.put(`/sku/task/${taskId}`, req)
  return plainToClass(SkuTask, result)
}

// 获取任务
export const getSkuTask = async (taskId: number) => {
  const result = await instance.get(`/sku/task/${taskId}`)
  return plainToClass(SkuTask, result)
}

// 获取任务步骤
export const getSkuTaskSteps = async (taskId: number, stepKey: string, resourceId: number, groupCode: string) => {
  return await getDataList(SkuTaskStep, `/sku/task/steps/${resourceId}/${groupCode}/${taskId}/${stepKey}`)
}

// 保存任务步骤
export const saveSkuTaskStep = async (req: SkuTaskStep) => {
  const result = await instance.post('/sku/task/steps/save', req)
  return plainToClass(SkuTaskStep, result)
}

export const initSkuStep = async (taskId: number, stepKey: string, resourceId: number, groupCode: string) => {
  return instance.post(`/sku/task/steps/${resourceId}/${groupCode}/${taskId}/${stepKey}/init`, {})
}

// 分页获取商品任务
export const getSkuTaskPage = async (req: SkuTaskPageReq) => {
  const result = await instance.get(`/sku/task/page`, { params: req })
  return plainToClass(BasePageResp<SkuTaskPageResp>, result)
}

// 分页获取商品任务
export const GetSkuTaskStatusLabelValue = async () => {
  const result = await instance.get('/sku/task/status/enums')
  return plainToClass(Array<LabelValue>, result)
}

// 创建任务步骤日志
export const createSkuTaskStepLog = async (req: SkuTaskStepLog) => {
  const result = await instance.post('/sku/task/steps/log', req)
  return plainToClass(SkuTaskStepLog, result)
}

// 获取任务步骤日志
export const getSkuTaskStepLog = async (skuTaskStepId: number) => {
  const result = await instance.get(`/sku/task/steps/log/${skuTaskStepId}`)
  return plainToClass(SkuTaskStepLog, result)
}
