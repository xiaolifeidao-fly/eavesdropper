package models

import "server/common/middleware/database"

type User struct {
	database.BaseEntity
	Nickname string `json:"nickname"` // 用户名称
	Mobile   string `json:"mobile"`   // 手机号,唯一
}

func (u *User) TableName() string {
	return "auth_user"
}
