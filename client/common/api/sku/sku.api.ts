import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { AddSkuReq, SkuPageReq, SkuPageResp, CheckSkuExistenceReq, SkuMapper, Sku } from '@model/sku/sku'
import { BasePageResp } from '@model/base/base'

// 添加商品
export const addSku = async (req: AddSkuReq) => {
  const result = await instance.post(`/sku`, req)
  return plainToClass(Number, result)
}

// 校验商品是否存在
export const checkSkuExistence = async (req: CheckSkuExistenceReq) => {
  const result = await instance.get(`/sku/check-existence`, { params: req })
  return plainToClass(Boolean, result)
}

// 分页获取商品
export const getSkuPage = async (req: SkuPageReq) => {
  const result = await instance.get(`/sku/page`, { params: req })
  return plainToClass(BasePageResp<SkuPageResp>, result)
}

export const createSkuMappers = async (req: SkuMapper[]) => {
  await instance.post(`/sku/mappers`, req)
}

export const getSkuByPublishResourceIdAndPublishSkuId = async (publishResourceId: number, publishSkuId: string) => {
  const result = await instance.get(`/sku/get/${publishResourceId}/${publishSkuId}`)
  return plainToClass(Sku, result)
}
