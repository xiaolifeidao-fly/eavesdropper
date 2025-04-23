package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

type GatherBatchDTO struct {
	dto.BaseDTO
	UserID  uint64 `json:"userId"`
	BatchNo string `json:"batchNo"`
	Name    string `json:"name"`
	Source  string `json:"source"`
}

type GatherBatchPageParamDTO struct {
	page.Query     `search:"-"`
	UserID         uint64 `search:"type:eq;table:gather_batch;column:user_id"`
	CreatedAtStart string `form:"createdAtStart" search:"type:gte;table:gather_batch;column:created_at"`
	CreatedAtEnd   string `form:"createdAtEnd" search:"type:lte;table:gather_batch;column:created_at"`
	_              any    `search:"type:order;table:gather_batch;column:id;default:desc"`
	_              any    `search:"type:isNull;table:gather_batch;column:deleted_at"`
}

type GatherBatchPageDTO struct {
	ID        uint64    `json:"id" select:"table:gather_batch;column:id"`
	UserID    uint64    `json:"userId" select:"table:gather_batch;column:user_id"`
	BatchNo   string    `json:"batchNo" select:"table:gather_batch;column:batch_no"`
	Name      string    `json:"name" select:"table:gather_batch;column:name"`
	Source    string    `json:"source" select:"table:gather_batch;column:source"`
	CreatedAt base.Time `json:"createdAt" select:"table:gather_batch;column:created_at"`
}
