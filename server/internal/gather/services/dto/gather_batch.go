package dto

import (
	"server/common/base/dto"
)

type GatherBatchDTO struct {
	dto.BaseDTO
	UserID  uint64 `json:"userId"`
	BatchNo string `json:"batchNo"`
	Name    string `json:"name"`
	Source  string `json:"source"`
}
