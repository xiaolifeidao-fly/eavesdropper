import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { BasePageResp, LabelValue } from '@model/base/base'
import { FeedbackPage, FeedbackPageReq } from '@/model/feedback/feedback'

export const getFeedbackPage = async (req: FeedbackPageReq) => {
  const result = await instance.get(`/feedback/page`, { params: req })
  return plainToClass(BasePageResp<FeedbackPage>, result)
}

export const getFeedbackStatusEnums = async () => {
  const result = await instance.get(`/feedback/status/enums`)
  return plainToClass(Array<LabelValue>, result)
}