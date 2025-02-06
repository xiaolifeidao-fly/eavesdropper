package models

import "server/common/middleware/database"

type SkuTask struct {
	database.BaseEntity
	UserID            uint64 `json:"userId"`
	PublishResourceID uint64 `json:"publishResourceId"`
	Status            string `json:"status"`
	Remark            string `json:"remark"`
	Count             int    `json:"count"`
	PriceRate         string `json:"priceRate"`
}

func (s *SkuTask) TableName() string {
	return "sku_task"
}
