package models

import "server/common/middleware/database"

type Shop struct {
	database.BaseEntity
	UserID     uint64 `json:"userId"`
	ResourceID uint64 `json:"resourceId"`
	Name       string `json:"name"`
	ShopID     uint64 `json:"shopId"`
	Remark     string `json:"remark"`
	Status     string `json:"status"`
}

func (Shop) TableName() string {
	return "shop"
}
