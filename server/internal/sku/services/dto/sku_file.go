package dto

import "server/common/base/dto"

type SkuFileInfoDTO struct {
	dto.BaseDTO
	Id     uint64 `json:"id"`
	SkuId  uint64 `json:"skuId"`
	FileId uint64 `json:"fileId"`
	SortId uint32 `json:"sortId"`
}

type SkuFileDetailDTO struct {
	dto.BaseDTO
	SkuId    uint64 `json:"skuId"`
	FileType string `json:"fileType"`
	FileUrl  string `json:"fileUrl"`
	FileName string `json:"fileName"`
	SortId   uint32 `json:"sortId"`
}
