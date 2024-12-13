package dto

import "server/common/base/dto"

type UserPasswordDTO struct {
	dto.BaseDTO
	UserID      uint64 `json:"userId"`      // 用户ID
	Password    string `json:"password"`    // 密码
	OriPassword string `json:"oriPassword"` // 原始密码
}
