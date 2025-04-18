import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { GatherBatch, GatherBatchCreateReq } from '@model/gather/gather-batch'

export const addGatherBatch = async (req: GatherBatchCreateReq) => {
  const result = await instance.post(`/gather-batch`, req)
  return plainToClass(GatherBatch, result)
}
