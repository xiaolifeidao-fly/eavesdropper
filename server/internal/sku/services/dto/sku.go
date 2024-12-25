package dto

import "server/common/base/dto"

type SkuDTO struct {
	dto.BaseDTO
	UserID            uint64 `json:"userId"`
	Name              string `json:"name"`
	SourceSkuID       string `json:"sourceSkuId"`
	TaskID            uint64 `json:"taskId"`
	Status            string `json:"status"`
	PublishResourceID uint64 `json:"publishResourceId"`
}
