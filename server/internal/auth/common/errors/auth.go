package errors

import "errors"

var (
	ErrAuthPassword     = errors.New("密码错误")
	ErrAuthPasswordSame = errors.New("新密码与旧密码相同")
	ErrAuthCache        = errors.New("获取缓存中登录用户信息失败")
)
