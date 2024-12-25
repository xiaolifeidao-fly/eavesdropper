package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type Sku struct {
	database.BaseEntity
	UserId            uint64    `json:"userId"`
	Name              string    `json:"name"`
	SourceSkuId       string    `json:"sourceSkuId"`
	TaskId            uint64    `json:"taskId"`
	Status            string    `json:"status"`
	Url               string    `json:"url"`
	PublishResourceId uint64    `json:"publishResourceId"`
	PublishTime       base.Time `json:"publishTime"`
}

func (s *Sku) TableName() string {
	return "sku"
}
