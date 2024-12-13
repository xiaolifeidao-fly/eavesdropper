package dto

import (
	"server/common/base/dto"
)

// UserDTO 用户
type UserDTO struct {
	dto.BaseDTO
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
}

// UserInfoDTO 用户信息
type UserInfoDTO struct {
	ID       uint64 `json:"id"`
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
}
