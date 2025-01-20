package models

import "server/common/middleware/database"

type Shop struct {
	database.BaseEntity
	UserID     uint64 `json:"userId"`
	ResourceID uint64 `json:"resourceId"`
	Name       string `json:"name"`
	Remark     string `json:"remark"`
}

func (Shop) TableName() string {
	return "shop"
}
