package dto

import (
	"server/common/base"
	"server/common/captcha"
	"server/internal/auth/models"
	"time"
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

// ToUserLoginRecord 转换为UserLoginRecord
func (req *LoginReq) ToUserLoginRecord(userID uint64, userLoginRecord *models.UserLoginRecord) {
	userLoginRecord.UserID = userID
	userLoginRecord.LoginTime = base.Time(time.Now())
	userLoginRecord.LoginIP = req.LoginIP
	userLoginRecord.LoginDeviceID = req.DeviceID
	userLoginRecord.CreatedBy = userID
	userLoginRecord.UpdatedBy = userID
}

// LoginResp 登录响应
type LoginResp struct {
	AccessToken string `json:"accessToken"`
}

// LoginUserResp 登录用户信息
type LoginUserResp struct {
	ID       uint64 `json:"id"`
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
}

func (resp *LoginUserResp) FromUser(dbUser *models.User) {
	resp.ID = dbUser.ID
	resp.Nickname = dbUser.Nickname
}

// CaptchaResp 验证码响应
type CaptchaResp struct {
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}

// FromCaptcha 从captcha.Captcha转换为CaptchaResp
func (captchaResp *CaptchaResp) FromCaptcha(captcha captcha.Captcha) {
	captchaResp.CaptchaID = captcha.CaptchaID
	captchaResp.CaptchaImg = captcha.CaptchaImg
}

// RegisterReq 注册请求
type RegisterReq struct {
	Nickname  string `json:"nickname" binding:"required"`
	Mobile    string `json:"mobile" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captchaId" binding:"required"`
	Captcha   string `json:"captcha" binding:"required"`
}

// ToUser 转换为User
func (req *RegisterReq) ToUser(dbUser *models.User) {
	dbUser.Nickname = req.Nickname
	dbUser.Mobile = req.Mobile
}
