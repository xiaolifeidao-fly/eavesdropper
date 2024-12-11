package errors

import "errors"

var (
	ErrAuthPassword = errors.New("密码错误")
	ErrAuthCache    = errors.New("获取缓存中登录用户信息失败")

	ErrLoginCaptcha = errors.New("验证码错误")
)
