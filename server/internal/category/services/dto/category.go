package dto

import "server/common/base/dto"

type CategoryDTO struct {
	dto.BaseDTO
	TbId      uint64 `json:"tbId"`
	Name      string `json:"name"`
	PId       uint64 `json:"pId"`
	Leaf      bool   `json:"leaf"`
	GroupName string `json:"groupName"`
	GroupId   string `json:"groupId"`
}
