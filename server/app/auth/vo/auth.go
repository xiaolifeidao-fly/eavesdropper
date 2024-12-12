package vo

import (
	"server/common/base/time"
	"server/common/base/vo"
)

// LoginReq 登录请求
type LoginReq struct {
	Mobile    string `json:"mobile" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captchaId" binding:"required"`
	Captcha   string `json:"captcha" binding:"required"`
	LoginIP   string `json:"loginIp"`
	DeviceID  string `json:"deviceId"`
}

// LoginResp 登录响应
type LoginResp struct {
	AccessToken string `json:"accessToken"`
}

// LoginUserResp 登录用户信息
type LoginUserResp struct {
	ID       uint64    `json:"id"`
	Nickname string    `json:"nickname"`
	Mobile   string    `json:"mobile"`
	LoginAt  time.Time `json:"loginAt"`
}

// CaptchaResp 验证码响应
type CaptchaResp struct {
	vo.BaseVO
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}

// RegisterReq 注册请求
type RegisterReq struct {
	vo.BaseVO
	Nickname  string `json:"nickname" binding:"required"`
	Mobile    string `json:"mobile" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captchaId" binding:"required"`
	Captcha   string `json:"captcha" binding:"required"`
}
