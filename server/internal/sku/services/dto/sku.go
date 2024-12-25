package dto

import "server/common/base/dto"

type SkuDTO struct {
	dto.BaseDTO
	UserId            uint64 `json:"userId"`
	SourceSkuId       uint64 `json:"sourceSkuId"`
	TaskId            uint64 `json:"taskId"`
	Status            string `json:"status"`
	PublishResourceId uint64 `json:"publishResourceId"`
}
