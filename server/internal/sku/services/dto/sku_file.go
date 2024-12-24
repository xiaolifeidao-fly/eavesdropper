package dto

import "server/common/base/dto"

type SkuFileInfoDTO struct {
	dto.BaseDTO
	Id     uint64 `json:"id"`
	SkuId  uint64 `json:"skuId"`
	FileId uint64 `json:"fileId"`
	SortId uint32 `json:"sortId"`
}
