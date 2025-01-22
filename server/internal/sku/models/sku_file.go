package models

import "server/common/middleware/database"

type SkuFileInfo struct {
	database.BaseEntity
	SkuId  uint64 `json:"sku_id"`
	FileId uint64 `json:"file_id"`
	Type   string `json:"type"`
	SortId int32  `json:"sort_id"`
}

type SkuFileDetail struct {
	database.BaseEntity
	SkuId    uint64 `json:"sku_id"`
	FileType string `json:"file_type"`
	FileUrl  string `json:"file_url"`
	FileSize uint64 `json:"file_size"`
	FileName string `json:"file_name"`
	SortId   uint32 `json:"sort_id"`
}

func (f *SkuFileDetail) TableName() string {
	return "sku_file_detail"
}
