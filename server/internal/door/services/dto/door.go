package dto

import (
	"server/common/base"
	"server/common/base/dto"
)

type DoorRecordDTO struct {
	dto.BaseDTO
	ItemKey    string    `json:"itemKey"`
	Type       string    `json:"type"`
	DoorKey    string    `json:"doorKey"`
	Url        string    `json:"url"`
	Data       string    `json:"data"`
	Version    string    `json:"version"`
	ExpireTime base.Time `json:"expire_time"`
}

type DoorFileRecordDTO struct {
	dto.BaseDTO
	ResourceId uint64 `json:"resourceId"`
	Source     string `json:"source"`
	FileType   string `json:"fileType"`
	FileSize   uint64 `json:"fileSize"`
	FolderId   string `json:"folderId"`
	FileId     string `json:"fileId"`
	FileUrl    string `json:"fileUrl"`
	FileName   string `json:"fileName"`
	FileKey    string `json:"fileKey"`
}
