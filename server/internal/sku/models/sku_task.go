package models

import "server/common/middleware/database"

type SkuTask struct {
	database.BaseEntity
	UserID            uint64 `json:"userId"`
	PublishResourceID uint64 `json:"publishResourceId"`
	Count             int    `json:"count"`
	Progress          int    `json:"progress"`
	Status            string `json:"status"`
}

func (s *SkuTask) TableName() string {
	return "sku_task"
}
