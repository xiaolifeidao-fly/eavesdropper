package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

// UserDTO 用户
type UserDTO struct {
	dto.BaseDTO
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
}

// UserInfoDTO 用户信息
type UserInfoDTO struct {
	ID          uint64    `json:"id"`
	Nickname    string    `json:"nickname"`
	Mobile      string    `json:"mobile"`
	UpdatedAt   base.Time `json:"updatedAt"`
	LastLoginAt base.Time `json:"lastLoginAt"`
}

// UserAddDTO 用户添加
type UserAddDTO struct {
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
	Password string `json:"password"`
}

// UserUpdateDTO 用户更新
type UserUpdateDTO struct {
	ID          uint64 `json:"id"`
	Nickname    string `json:"nickname"`
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// UserPageParamDTO 用户分页参数
type UserPageParamDTO struct {
	page.Query `search:"-"`
	Mobile     string      `search:"type:eq;table:auth_user;column:mobile"`
	_          string      `search:"type:order;table:auth_user;column:id;default:asc"`
	_          interface{} `search:"type:isNull;table:auth_user;column:deleted_at"`
}

// UserPageDTO 用户分页
type UserPageDTO struct {
	ID          uint64    `json:"id" select:"table:auth_user;column:id"`
	Nickname    string    `json:"nickname" select:"table:auth_user;column:nickname"`
	Mobile      string    `json:"mobile" select:"table:auth_user;column:mobile"`
	LastLoginAt base.Time `json:"lastLoginAt" select:"-"`
	UpdatedAt   base.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
}
