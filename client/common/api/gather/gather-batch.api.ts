import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { GatherBatch, GatherBatchCreateReq, GatherBatchPageReq, GatherBatchPage } from '@model/gather/gather-batch'
import { BasePageResp } from '@model/base/base'
import { GatherSku } from '@model/gather/gather-sku'

export const addGatherBatch = async (req: GatherBatchCreateReq) => {
  const result = await instance.post(`/gather-batch`, req)
  return plainToClass(GatherBatch, result)
}

export const getGatherBatchPage = async (req: GatherBatchPageReq) => {
  const result = await instance.get(`/gather-batch/page`, { params: req })
  return plainToClass(BasePageResp<GatherBatchPage>, result)
}

export const getGatherBatchSkuList = async (id: number) => {
  const result = await instance.get(`/gather-batch/${id}/sku-list`)
  return plainToClass(Array<GatherSku>, result)
}

export const getGatherBatchInfo = async (id: number) => {
  const result = await instance.get(`/gather-batch/${id}`)
  return plainToClass(GatherBatch, result)
}
