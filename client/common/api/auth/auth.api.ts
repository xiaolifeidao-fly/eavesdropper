import { plainToClass } from 'class-transformer'

import { instance } from '@utils/axios'
import { LoginReq, LoginResp, CaptchaResp, RegisterReq, LoginUserResp } from '@model/auth/auth'

// login 登录
export const login = async (req: LoginReq) => {
  const result = await instance.post('/api/auth/login', req)
  return plainToClass(LoginResp, result)
}

// register 注册
export const register = async (req: RegisterReq) => {
  const result = await instance.post('/api/auth/register', req)
  return plainToClass(String, result)
}

// 获取登录验证码
export const getLoginCaptcha = async () => {
  const result = await instance.get('/api/auth/captcha')
  return plainToClass(CaptchaResp, result)
}

// 获取登录用户信息
export const getLoginUserInfo = async () => {
  const result = await instance.get('/api/auth/login-user')
  return plainToClass(LoginUserResp, result)
}

// 登出
export const logout = async () => {
  const result = await instance.post('/api/auth/logout')
  return plainToClass(String, result)
}

