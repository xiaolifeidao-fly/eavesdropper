package models

import "server/common/base"

type User struct {
	base.Model
	Nickname string `json:"nickname"` // 用户名称
	Username string `json:"username"` // 用户名,唯一
	Mobile   string `json:"mobile"`   // 手机号,唯一
}

func (u *User) TableName() string {
	return "auth_user"
}
