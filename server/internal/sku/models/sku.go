package models

import "server/common/middleware/database"

type Sku struct {
	database.BaseEntity
	UserId            uint64 `json:"userId"`
	SourceSkuId       uint64 `json:"sourceSkuId"`
	TaskId            uint64 `json:"taskId"`
	Status            string `json:"status"`
	PublishResourceId uint64 `json:"publishResourceId"`
}

func (s *Sku) TableName() string {
	return "sku"
}
