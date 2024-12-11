// 登录请求
export class LoginReq {
  constructor(
    public username: string,
    public password: string,
    public captcha: string,
    public captchaId: string
  ) {
    this.username = username
    this.password = password
    this.captcha = captcha
    this.captchaId = captchaId
  }
}

// 登录响应
export class LoginResp {
  constructor(public accessToken: string) {
    this.accessToken = accessToken
  }
}

// 登录用户信息
export class LoginUserResp {
  constructor(public id: number, public nickname: string, public username: string) {
    this.id = id
    this.nickname = nickname
    this.username = username
  }
}

// 登录验证码响应
export class LoginCaptchaResp {
  constructor(public captchaId: string, public captchaImg: string) {
    this.captchaId = captchaId
    this.captchaImg = captchaImg
  }
}
