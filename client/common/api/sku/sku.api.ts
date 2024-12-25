import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { AddSkuReq, SkuPageReq, SkuPageResp } from '@model/sku/sku'
import { BasePageResp } from '@model/base/base'

// 添加商品
export const addSku = async (req: AddSkuReq) => {
  const result = await instance.post(`/sku`, req)
  return plainToClass(Number, result)
}

// 分页获取商品
export const getSkuPage = async (req: SkuPageReq) => {
  const result = await instance.get(`/sku/page`, { params: req })
  return plainToClass(BasePageResp<SkuPageResp>, result)
}