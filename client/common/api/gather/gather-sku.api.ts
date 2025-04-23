import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { GatherSku, GatherSkuCreateReq } from '@model/gather/gather-sku'

export const addGatherSku = async (req: GatherSkuCreateReq) => {
  const result = await instance.post(`/gather-sku`, req)
  return plainToClass(GatherSku, result)
}
