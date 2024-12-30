package models

import "server/common/middleware/database"

type SkuTaskItem struct {
	database.BaseEntity
	TaskId uint64 `json:"taskId"`
	Url    string `json:"url"`
	Status string `json:"status"`
	Remark string `json:"remark"`
}

func (s *SkuTaskItem) TableName() string {
	return "sku_task_item"
}
