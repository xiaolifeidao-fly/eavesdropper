package dto

import (
	"server/common/base/dto"
)

type SkuTaskDTO struct {
	dto.BaseDTO
	UserID            uint64 `json:"userId"`
	PublishResourceID uint64 `json:"publishResourceId"`
	Count             int    `json:"count"`
	Progress          int    `json:"progress"`
	Status            string `json:"status"`
}
