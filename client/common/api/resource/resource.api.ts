import { plainToClass } from 'class-transformer'

import { instance, getDataList } from '@utils/axios'
import { BasePageResp, LabelValue } from '@model/base/base'
import {
  AddResourceReq,
  ResourcePageReq,
  ResourcePageResp,
  ResourceResp,
  UpdateResourceReq,
  BindResourceReq
} from '@model/resource/resource'

// 添加资源
export const addResource = async (req: AddResourceReq) => {
  const result = await instance.post(`/resource`, req)
  return plainToClass(String, result)
}

// 删除资源
export const deleteResource = async (id: number) => {
  const result = await instance.delete(`/resource/${id}`)
  return plainToClass(String, result)
}

// 更新资源
export const updateResource = async (id: number, req: UpdateResourceReq) => {
  const result = await instance.put(`/resource/${id}`, req)
  return plainToClass(String, result)
}

// 获取资源
export const getResource = async (id: number) => {
  const result = await instance.get(`/resource/${id}`)
  return plainToClass(ResourceResp, result)
}

// 分页获取资源
export const getResourcePage = async (req: ResourcePageReq) => {
  const result = await instance.get(`/resource/page`, { params: req })
  return plainToClass(BasePageResp<ResourcePageResp>, result)
}

// 绑定资源
export const bindResource = async (id: number, req: BindResourceReq) => {
  const result = await instance.post(`/resource/bind/${id}`, req)
  return plainToClass(String, result)
}

// 获取资源来源列表
export const getResourceSourceList = async () => {
  return getDataList(LabelValue, "/resource/source");
}

// 获取资源标签列表
export const getResourceTagList = async () => {
  const result = await instance.get(`/resource/tag`)
  return plainToClass(Array<LabelValue>, result)
}

// 获取主资源列表
export const getMainResourceList = async () => {
  return getDataList(ResourceResp, "/resource/main");
}
