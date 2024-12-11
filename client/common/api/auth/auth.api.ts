import { instance } from "@util/axios"
import { LoginReq, LoginResp } from "@model/auth/auth"

// login 登录
export const login = async (req: LoginReq) => {
  const result = await instance.post("auth/login", req)
  console.log(result)
  return result
}

// 获取登录验证码
export const getLoginCaptcha = async () => {
  const result = await instance.get("auth/login-captcha")
  console.log(result)
  return result
}
