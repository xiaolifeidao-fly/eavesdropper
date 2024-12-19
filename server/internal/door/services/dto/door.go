package dto

import (
	"server/common/base"
	"server/common/base/dto"
)

type DoorRecordDTO struct {
	dto.BaseDTO
	ItemKey    string    `json:"itemKey"`
	Type       string    `json:"type"`
	DoorKey    string    `json:"doorKey"`
	Url        string    `json:"url"`
	Data       string    `json:"data"`
	ExpireTime base.Time `json:"expire_time"`
}
