package models

import "server/common/middleware/database"

type SkuDraft struct {
	database.BaseEntity
	SkuItemId  string `json:"sku_item_id"`
	SkuDraftId string `json:"sku_draft_id"`
	Status     string `json:"status"`
	ResourceId int64  `json:"resource_id"`
}

func (s *SkuDraft) TableName() string {
	return "sku_draft"
}
