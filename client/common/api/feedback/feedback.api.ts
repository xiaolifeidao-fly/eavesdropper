import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { BasePageResp, LabelValue } from '@model/base/base'
import { FeedbackPage, FeedbackPageReq, AddFeedbackReq, FeedbackInfo } from '@model/feedback/feedback'

export const getFeedbackPage = async (req: FeedbackPageReq) => {
  const result = await instance.get(`/feedback/page`, { params: req })
  return plainToClass(BasePageResp<FeedbackPage>, result)
}

export const AddFeedback = async (req: FormData) => {

  const result = await instance.postForm(`/file/feedback`, req)

  // const result = await instance.post(`/feedback`, req)
  return plainToClass(Number, result)
}

export const getFeedbackInfo = async (id: number) => {
  const result = await instance.get(`/feedback/${id}/info`)
  return plainToClass(FeedbackInfo, result)
}

export const getFeedbackStatusEnums = async () => {
  const result = await instance.get(`/feedback/status/enums`)
  return plainToClass(Array<LabelValue>, result)
}

export const getFeedbackTypeEnums = async () => {
  const result = await instance.get(`/feedback/type/enums`)
  return plainToClass(Array<LabelValue>, result)
}

export const markFeedbackProcessing = async (id: number) => {
  const result = await instance.put(`/feedback/${id}/mark/process`)
  return plainToClass(FeedbackInfo, result)
}

export const resolvedFeedback = async (id: number, result: string) => {
  const res = await instance.put(`/feedback/${id}/resolved`, { result })
  return plainToClass(FeedbackInfo, res)
}

export const userIsAdmin = async () => {
  const result = await instance.get(`/feedback/admin`)
  return plainToClass(Boolean, result)
}
