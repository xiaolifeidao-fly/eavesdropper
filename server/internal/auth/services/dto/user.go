package dto

import "server/common/base/dto"

// UserDTO 用户
type UserDTO struct {
	dto.BaseDTO
	ID       uint   `json:"id"`
	Nickname string `json:"nickname"`
	Mobile   string `json:"mobile"`
}
