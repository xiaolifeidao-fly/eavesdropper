package dto

import "server/common/base/dto"

// Captcha 验证码
type CaptchaDTO struct {
	dto.BaseDTO
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}

// RegisterDTO 注册请求
type RegisterDTO struct {
	dto.BaseDTO
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
	Password string `json:"password"`
}
