package dto

import "server/common/base/dto"

const (
	DRAFT_ACTIVE  = "active"
	DRAFT_EXPIRED = "expired"
)

type SkuDraftDto struct {
	dto.BaseDTO
	SkuItemID  string `json:"skuItemId"`
	SkuDraftId string `json:"skuDraftId"`
	Status     string `json:"status"`
	ResourceId int64  `json:"resourceId"`
}
