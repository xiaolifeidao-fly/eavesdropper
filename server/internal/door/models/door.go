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
	Data       string    `json:"data"`
	ExpireTime base.Time `json:"expire_time"`
}

func (u *DoorRecord) TableName() string {
	return "door_record"
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
}

func (f *DoorFileRecord) TableName() string {
	return "door_file_record"
}
