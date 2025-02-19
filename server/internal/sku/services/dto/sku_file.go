package dto

import "server/common/base/dto"

type SkuFileInfoDTO struct {
	dto.BaseDTO
	Id        uint64 `json:"id"`
	FileId    uint64 `json:"fileId"`
	SortId    uint32 `json:"sortId"`
	SkuItemId string `json:"skuItemId"`
}

type SkuFileDetailDTO struct {
	dto.BaseDTO
	ItemFileId string `json:"itemFileId"`
	FileType   string `json:"fileType"`
	FileUrl    string `json:"fileUrl"`
	FileSize   uint64 `json:"fileSize"`
	FileName   string `json:"fileName"`
	SortId     uint32 `json:"sortId"`
	SkuItemId  string `json:"skuItemId"`
	Pix        string `json:"pix"`
}
