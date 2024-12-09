package models

import (
	"server/common/base"
)

type UserLoginRecord struct {
	base.Model
	UserID        uint64    `json:"userId"`
	LoginTime     base.Time `json:"loginTime"`
	LoginIP       string    `json:"loginIp"`
	LoginDeviceID string    `json:"loginDeviceId"` // 登录设备ID
}

func (u *UserLoginRecord) TableName() string {
	return "auth_user_login_record"
}
