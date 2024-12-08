package models

import "server/common/base"

type User struct {
	base.Model
	Uid      string `json:"uid"`      // 用户uid
	Name     string `json:"name"`     // 用户名称
	Account  string `json:"account"`  // 账户
	Password string `json:"password"` // 密码
	Secret   string `json:"secret"`   // 密钥
}

func (u *User) TableName() string {
	return "auth_user"
}
