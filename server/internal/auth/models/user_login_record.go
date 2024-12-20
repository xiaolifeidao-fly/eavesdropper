package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type UserLoginRecord struct {
	database.BaseEntity
	UserID        uint64    `json:"userId"`
	LoginTime     base.Time `json:"loginTime"`
	LoginIP       string    `json:"loginIp"`
	LoginDeviceID string    `json:"loginDeviceId"` // 登录设备ID
}

func (u *UserLoginRecord) TableName() string {
	return "auth_user_login_record"
}
