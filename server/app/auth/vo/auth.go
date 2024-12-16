package vo

import (
	"server/common/base"
	"server/common/base/vo"
)

// LoginReq 登录请求
type LoginReq struct {
	Mobile    string `json:"mobile" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captchaId" binding:"required"`
	Captcha   string `json:"captcha" binding:"required"`
}

// LoginResp 登录响应
type LoginResp struct {
	AccessToken string `json:"accessToken"`
}

// CaptchaResp 验证码响应
type CaptchaResp struct {
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}

// RegisterReq 注册请求
type RegisterReq struct {
	Nickname  string `json:"nickname" binding:"required"`
	Mobile    string `json:"mobile" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captchaId" binding:"required"`
	Captcha   string `json:"captcha" binding:"required"`
}

// LoginUserResp 登录用户信息
type LoginUserResp struct {
	ID       uint64    `json:"id"`
	Nickname string    `json:"nickname"`
	Mobile   string    `json:"mobile"`
	LoginAt  base.Time `json:"loginAt"`
}

// UpdateAuthUserReq 更新个人信息请求
type UpdateAuthUserReq struct {
	vo.BaseVO
	Nickname string `json:"nickname" binding:"required"`
}

// ModifyAuthUserPasswordReq 修改密码请求
type ModifyAuthUserPasswordReq struct {
	vo.BaseVO
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}
