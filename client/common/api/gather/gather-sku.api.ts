import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { GatherSku, GatherSkuCreateReq } from '@model/gather/gather-sku'

export const addGatherSku = async (req: GatherSkuCreateReq) => {
  const result = await instance.post(`/gather-sku`, req)
  return plainToClass(GatherSku, result)
}

export const favoriteGatherSku = async (id: number, isFavorite: boolean) => {
  const result = await instance.put(`/gather-sku/${id}/favorite`, { isFavorite })
  return plainToClass(GatherSku, result)
}

export const getGatherSkuByID = async (id: number) => {
  const result = await instance.get(`/gather-sku/${id}`)
  return plainToClass(GatherSku, result)
}
