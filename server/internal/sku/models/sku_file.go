package models

import "server/common/middleware/database"

type SkuFileInfo struct {
	database.BaseEntity
	FileId    uint64 `json:"file_id"`
	Type      string `json:"type"`
	SortId    int32  `json:"sort_id"`
	SkuItemId string `json:"sku_item_id"`
}

type SkuFileDetail struct {
	database.BaseEntity
	SkuItemId  string `json:"sku_item_id"`
	FileType   string `json:"file_type"`
	ItemFileId string `json:"item_file_id"`
	FileUrl    string `json:"file_url"`
	FileSize   uint64 `json:"file_size"`
	FileName   string `json:"file_name"`
	SortId     uint32 `json:"sort_id"`
}

func (f *SkuFileInfo) TableName() string {
	return "sku_file_info"
}
