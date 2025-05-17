import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { BasePageResp, LabelValue } from '@model/base/base'
import { FeedbackPage, FeedbackPageReq, AddFeedbackReq } from '@/model/feedback/feedback'

export const getFeedbackPage = async (req: FeedbackPageReq) => {
  const result = await instance.get(`/feedback/page`, { params: req })
  return plainToClass(BasePageResp<FeedbackPage>, result)
}

export const AddFeedback = async (req: AddFeedbackReq) => {
  const result = await instance.post(`/feedback`, req)
  return plainToClass(Number, result)
}

export const getFeedbackStatusEnums = async () => {
  const result = await instance.get(`/feedback/status/enums`)
  return plainToClass(Array<LabelValue>, result)
}

export const getFeedbackTypeEnums = async () => {
  const result = await instance.get(`/feedback/type/enums`)
  return plainToClass(Array<LabelValue>, result)
}