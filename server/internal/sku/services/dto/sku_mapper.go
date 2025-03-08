package dto

import "server/common/base/dto"

type SkuMapperDto struct {
	dto.BaseDTO
	SkuId          string `json:"skuId"`
	PxxSkuSaleInfo string `json:"pxxSkuSaleInfo"`
	TbSkuSaleInfo  string `json:"tbSkuSaleInfo"`
}
