// 登录请求
export class LoginReq {
  constructor(
    public mobile: string,
    public password: string,
    public captcha: string,
    public captchaId: string
  ) {
    this.mobile = mobile
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

// 注册请求
export class RegisterReq {
  constructor(
    public nickname: string,
    public mobile: string,
    public password: string,
    public captcha: string,
    public captchaId: string
  ) {
    this.nickname = nickname
    this.mobile = mobile
    this.password = password
    this.captcha = captcha
    this.captchaId = captchaId
  }
}

// 登录验证码响应
export class CaptchaResp {
  constructor(public captchaId: string, public captchaImg: string) {
    this.captchaId = captchaId
    this.captchaImg = captchaImg
  }
}

// 登录用户信息
export class LoginUserResp {
  constructor(
    public id: number,
    public nickname: string,
    public mobile: string,
    public loginAt: string
  ) {
    this.id = id
    this.nickname = nickname
    this.mobile = mobile
  }
}

// 更新个人信息请求
export class UpdateAuthUserReq {
  constructor(
    public nickname: string,
    public mobile: string,
  ) {
    this.nickname = nickname
    this.mobile = mobile
  }
}

// 修改密码请求
export class ModifyAuthUserPasswordReq {
  constructor(
    public oldPassword: string,
    public newPassword: string
  ) {
    this.oldPassword = oldPassword
    this.newPassword = newPassword
  }
}