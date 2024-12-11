import { plainToClass } from 'class-transformer';

import { instance } from '@utils/axios'
import { LoginReq, LoginResp, LoginCaptchaResp } from '@model/auth/auth'

// login 登录
export const login = async (req: LoginReq) => {
  const result = await instance.post('/api/auth/login', req)
  return plainToClass(LoginResp, result)
}

// 获取登录验证码
export const getLoginCaptcha = async () => {
  const result = await instance.get('/api/auth/login-captcha')
  return plainToClass(LoginCaptchaResp, result)
}
