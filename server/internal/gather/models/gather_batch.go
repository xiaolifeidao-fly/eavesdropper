package models

import (
	"server/common/middleware/database"
)

type GatherBatch struct {
	database.BaseEntity
	UserID     uint64 `json:"userId"`
	BatchNo    string `json:"batchNo"`
	Name       string `json:"name"`
	Source     string `json:"source"`
	ResourceId uint64 `json:"resourceId"`
}

func (s *GatherBatch) TableName() string {
	return "gather_batch"
}
