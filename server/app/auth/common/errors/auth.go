package errors

import "errors"

var (
	ErrLoginSuccess       = errors.New("登录成功")
	ErrLoginFailed        = errors.New("登录失败")
	ErrGetLoginUserFailed = errors.New("获取登录用户信息失败")
	ErrLogoutSuccess      = errors.New("登出成功")
	ErrLogoutFailed       = errors.New("登出失败")
)
