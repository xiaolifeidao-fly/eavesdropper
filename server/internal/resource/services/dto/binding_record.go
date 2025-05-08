package dto

import "server/common/base/dto"

type ResourceTokenBindingRecordDTO struct {
	dto.BaseDTO
	UserID        uint64 `json:"userId"`
	ResourceID    uint64 `json:"resourceId"`
	ShopID        uint64 `json:"shopId"`
	Token         string `json:"token"`
	BindingResult string `json:"bindingResult"`
}
