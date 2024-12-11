package dto

import (
	"server/common/base"
	"server/internal/auth/models"
	"time"
)

// LoginReq 登录请求
type LoginReq struct {
	Username  string `json:"username" binding:"required"`
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
	Username string `json:"username"`
}

func (resp *LoginUserResp) FromUser(dbUser *models.User) {
	resp.ID = dbUser.ID
	resp.Nickname = dbUser.Nickname
	resp.Username = dbUser.Username
}

// LoginCaptchaResp 登录验证码响应
type LoginCaptchaResp struct {
	CaptchaID  string `json:"captchaId"`
	CaptchaImg string `json:"captchaImg"`
}
