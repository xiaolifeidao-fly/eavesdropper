package models

import "server/common/middleware/database"

type Category struct {
	database.BaseEntity
	TbId      uint64 `json:"tbId"`
	Name      string `json:"name"`
	PId       uint64 `json:"pId"`
	Leaf      bool   `json:"leaf"`
	GroupName string `json:"groupName"`
	GroupId   string `json:"groupId"`
}

func (c *Category) TableName() string {
	return "category"
}
