package dto

import (
	"server/common/base"
	"server/common/base/dto"
)

// Captcha 验证码
type CaptchaDTO struct {
	dto.BaseDTO
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}

// LoginDTO 登录请求
type LoginDTO struct {
	dto.BaseDTO
	Mobile        string `json:"mobile"`
	Password      string `json:"password"`
	LoginIP       string `json:"loginIp"`
	LoginDeviceID string `json:"loginDeviceId"`
	Captcha       string `json:"captcha"`
	CaptchaID     string `json:"captchaId"`
}

// RegisterDTO 注册请求
type RegisterDTO struct {
	dto.BaseDTO
	Nickname  string `json:"nickname"`
	Mobile    string `json:"mobile"`
	Password  string `json:"password"`
	Captcha   string `json:"captcha"`
	CaptchaID string `json:"captchaId"`
}

// UserLoginInfoDTO 用户登录信息
type UserLoginInfoDTO struct {
	ID       uint64    `json:"id"`
	Nickname string    `json:"nickname"`
	Mobile   string    `json:"mobile"`
	LoginAt  base.Time `json:"loginAt"`
}
