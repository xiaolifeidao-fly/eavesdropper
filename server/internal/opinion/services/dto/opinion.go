package dto

import (
	"server/common/base/dto"
)

type OpinionDTO struct {
	dto.BaseDTO
	UserID      uint64 `json:"userId"`
	OpinionType string `json:"opinionType"`
	Title       string `json:"title"`
	Content     string `json:"content"`
}
