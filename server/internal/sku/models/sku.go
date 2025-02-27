package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type Sku struct {
	database.BaseEntity
	UserId            uint64    `json:"userId"`
	PublishResourceId uint64    `json:"publishResourceId"`
	TaskId            uint64    `json:"taskId"`
	Name              string    `json:"name"`
	SourceSkuId       string    `json:"sourceSkuId"`
	Source            string    `json:"source"`
	PublishSkuID      string    `json:"publishSkuId"`
	Url               string    `json:"url"`
	PublishTime       base.Time `json:"publishTime"`
	Status            string    `json:"status"`
}

func (s *Sku) TableName() string {
	return "sku"
}
