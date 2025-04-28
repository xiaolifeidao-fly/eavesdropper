package models

import (
	"server/common/middleware/database"
)

type ResourceTokenBindingRecord struct {
	database.BaseEntity
	UserID        uint64 `json:"userId"`
	ResourceID    uint64 `json:"resourceId"`
	ShopID        uint64 `json:"shopId"`
	Token         string `json:"token"`
	BindingResult string `json:"bindingResult"`
}

func (r *ResourceTokenBindingRecord) TableName() string {
	return "resource_token_binding_record"
}
