package models

import "server/common/middleware/database"

type SkuMapper struct {
	database.BaseEntity
	SkuId          string `json:"sku_id"`
	PxxSkuSaleInfo string `json:"pxx_sku_sale_info"`
	TbSkuSaleInfo  string `json:"tb_sku_sale_info"`
}

func (s *SkuMapper) TableName() string {
	return "sku_mapper"
}
