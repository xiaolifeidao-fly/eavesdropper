package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type Resource struct {
	database.BaseEntity
	UserID         uint64     `json:"userId"`
	Source         string     `json:"source"`
	Account        string     `json:"account"`
	Tag            string     `json:"tag"`
	Remark         string     `json:"remark"`
	ExpirationDate *base.Time `json:"expirationDate"`
}

func (r *Resource) TableName() string {
	return "resource"
}
