package models

import "server/common/middleware/database"

type Resource struct {
	database.BaseEntity
	UserID  uint64 `json:"userId"`
	Source  string `json:"source"`
	Account string `json:"account"`
	Tag     string `json:"tag"`
	Remark  string `json:"remark"`
}

func (r *Resource) TableName() string {
	return "resource"
}
