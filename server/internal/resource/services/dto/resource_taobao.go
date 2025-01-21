package dto

import "server/common/base/dto"

type ResourceTaobaoDTO struct {
	dto.BaseDTO
	ResourceID  uint64 `json:"resourceId"`
	Nick        string `json:"nick"`
	UserNumId   uint64 `json:"userNumId"`
	DisplayNick string `json:"displayNick"`
}
