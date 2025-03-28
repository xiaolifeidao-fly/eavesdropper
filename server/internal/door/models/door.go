package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type DoorRecord struct {
	database.BaseEntity
	ItemKey    string    `json:"item_key"`
	Type       string    `json:"type"`
	DoorKey    string    `json:"door_key"`
	Url        string    `json:"url"`
	OssUrl     string    `json:"oss_url"`
	Version    string    `json:"version"`
	ExpireTime base.Time `json:"expire_time"`
}

func (u *DoorRecord) TableName() string {
	return "door_record"
}

type DoorCatProp struct {
	database.BaseEntity
	ItemKey   string `json:"item_key"`
	Source    string `json:"source"`
	PropKey   string `json:"prop_key"`
	PropValue string `json:"prop_value"`
}

func (u *DoorCatProp) TableName() string {
	return "door_cat_prop"
}

type DoorFileRecord struct {
	database.BaseEntity
	ResourceId uint64 `json:"resource_id"`
	Source     string `json:"source"`
	FileType   string `json:"file_type"`
	FileSize   uint64 `json:"file_size"`
	FolderId   string `json:"folder_id"`
	FileId     string `json:"file_id"`
	FileUrl    string `json:"file_url"`
	FileName   string `json:"file_name"`
	FileKey    string `json:"file_key"`
	Pix        string `json:"pix"`
}

type SearchSkuRecord struct {
	database.BaseEntity
	SkuId    string `json:"sku_id"`
	Type     string `json:"type"`
	Title    string `json:"title"`
	PddSkuId string `json:"pdd_sku_id"`
}

func (f *DoorFileRecord) TableName() string {
	return "door_file_record"
}

func (s *SearchSkuRecord) TableName() string {
	return "search_sku_record"
}

type DoorCategory struct {
	database.BaseEntity
	PddCatId  string `json:"pdd_cat_id"`
	TbCatId   string `json:"tb_cat_id"`
	TbCatName string `json:"tb_cat_name"`
}

func (u *DoorCategory) TableName() string {
	return "door_category"
}
