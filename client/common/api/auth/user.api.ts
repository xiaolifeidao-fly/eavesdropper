import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { UserPageReq, UserPageResp } from '@model/auth/user'
import { BasePageResp } from '@model/base/base'

// 删除用户
export const deleteUser = async (id: number) => {
  const result = await instance.delete(`/api/users/${id}`)
  return plainToClass(String, result)
}

// 用户分页
export const userPage = async (req: UserPageReq) => {
  const result = await instance.get('/api/users/page', { params: req })
  return plainToClass(BasePageResp<UserPageResp>, result)
}
