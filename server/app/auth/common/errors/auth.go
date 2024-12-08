package errors

import "errors"

var (
	ErrAuthPassword     = errors.New("密码错误")
	ErrAuthPasswordSame = errors.New("新密码与旧密码相同")
)
