package models

import "server/common/middleware/database"

type SkuTaskItem struct {
	database.BaseEntity
	TaskId      uint64 `json:"taskId"`
	Url         string `json:"url"`
	Status      string `json:"status"`
	Remark      string `json:"remark"`
	SkuID       uint64 `json:"skuId"`
	Source      string `json:"source"`
	SourceSkuId string `json:"sourceSkuId"`
	Title       string `json:"title"`
}

func (s *SkuTaskItem) TableName() string {
	return "sku_task_item"
}

type SkuTaskItemStatusCount struct {
	TaskID uint64 `json:"taskId"`
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type SkuTaskStep struct {
	database.BaseEntity
	StepKey      string `json:"step_key"`
	Status       string `json:"status"`
	Code         string `json:"code"`
	GroupCode    string `json:"group_code"`
	ValidateUrl  string `json:"validate_url"`
	ResourceId   uint64 `json:"resource_id"`
	NeedNextSkip bool   `json:"need_next_skip"`
	Message      string `json:"message"`
}

func (s *SkuTaskStep) TableName() string {
	return "sku_task_step"
}
