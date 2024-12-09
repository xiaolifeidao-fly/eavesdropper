package dto

import (
	"server/common/base"
	"server/internal/auth/models"
	"time"
)

// LoginReq 登录请求
type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginRecordReq 登录日志请求
type LoginRecordReq struct {
	UserID        uint64    `json:"userId" binding:"required"`
	LoginTime     base.Time `json:"loginTime" binding:"required"`
	LoginIP       string    `json:"loginIp" binding:"required"`
	LoginDeviceID string    `json:"loginDeviceId" binding:"required"`
}

// From 从其他数据源填充LoginRecordReq
func (req *LoginRecordReq) From(userID uint64, loginIP string, loginDeviceID string) {
	req.UserID = userID
	req.LoginTime = base.Time(time.Now())
	req.LoginIP = loginIP
	req.LoginDeviceID = loginDeviceID
}

// ToUserLoginRecord 转换为UserLoginRecord
func (req *LoginRecordReq) ToUserLoginRecord(userLoginRecord *models.UserLoginRecord) {
	userLoginRecord.UserID = req.UserID
	userLoginRecord.LoginTime = req.LoginTime
	userLoginRecord.LoginIP = req.LoginIP
	userLoginRecord.LoginDeviceID = req.LoginDeviceID
	userLoginRecord.CreatedBy = req.UserID
	userLoginRecord.UpdatedBy = req.UserID
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
