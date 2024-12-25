import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { AddSkuReq } from '@model/sku/sku'

// 添加商品
export const addSku = async (req: AddSkuReq) => {
  const result = await instance.post(`/sku`, req)
  return plainToClass(Number, result)
}