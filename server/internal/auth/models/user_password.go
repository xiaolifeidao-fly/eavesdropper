package models

import "server/common/base"

type UserPassword struct {
	base.Model
	UserID      uint64 `json:"userId"`      // 用户ID
	Password    string `json:"password"`    // 密码
	OriPassword string `json:"oriPassword"` // 原始密码
}

func (u *UserPassword) TableName() string {
	return "auth_user_password"
}