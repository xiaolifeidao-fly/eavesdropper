package models

import "server/common/middleware/database"

type SkuFileInfo struct {
	database.BaseEntity
	SkuId  uint64 `json:"sku_id"`
	FileId uint64 `json:"file_id"`
	Type   string `json:"type"`
	SortId int32  `json:"sort_id"`
}

func (f *SkuFileInfo) TableName() string {
	return "sku_file_info"
}
