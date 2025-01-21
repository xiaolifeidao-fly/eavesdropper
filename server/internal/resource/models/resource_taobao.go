package models

import "server/common/middleware/database"

type ResourceTaobao struct {
	database.BaseEntity
	ResourceID  uint64 `json:"resourceId"`
	DisplayNick string `json:"displayNick"`
	Nick        string `json:"nick"`
	UserNumId   uint64 `json:"userNumId"`
}

func (r *ResourceTaobao) TableName() string {
	return "resource_taobao"
}
