package models

import (
	"server/common/middleware/database"
)

type GatherSku struct {
	database.BaseEntity
	BatchID  uint64 `json:"batchId"`
	Name     string `json:"name"`
	Source   string `json:"source"`
	Sales    string `json:"sales"`
	Price    string `json:"price"`
	SkuID    string `json:"skuId"`
	Favorite bool   `json:"favorite"`
}

func (s *GatherSku) TableName() string {
	return "gather_sku"
}
