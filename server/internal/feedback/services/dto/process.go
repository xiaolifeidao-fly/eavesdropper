package dto

import "server/common/base/dto"

type ProcessDTO struct {
	dto.BaseDTO
	FeedbackID uint64 `json:"feebackId"`
	UserID     uint64 `json:"userId"`
	Result     string `json:"result"`
}
