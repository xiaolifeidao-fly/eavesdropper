package dto

import "server/common/base/dto"

type GatherSkuDTO struct {
	dto.BaseDTO
	BatchID  uint64 `json:"batchId"`
	Name     string `json:"name"`
	Source   string `json:"source"`
	Sales    string `json:"sales"`
	Price    string `json:"price"`
	SkuID    string `json:"skuId"`
	Favorite bool   `json:"favorite"`
}
