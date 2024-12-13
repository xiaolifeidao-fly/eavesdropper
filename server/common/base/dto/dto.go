package dto

import (
	"server/common/base"
)

type DTO interface {
	GetID() uint64
}

type BaseDTO struct {
	ID        uint64    `json:"id"`
	CreatedAt base.Time `json:"createdAt"`
	UpdatedAt base.Time `json:"updatedAt"`
	CreatedBy uint64    `json:"createdBy"`
	UpdatedBy uint64    `json:"updatedBy"`
	DeleteAt  base.Time `json:"deleteAt"`
}

func (dto *BaseDTO) GetID() uint64 {
	return dto.ID
}

type QueryDTO struct {
	Current  int `json:"current"`
	PageSize int `json:"size"`
}

func (q *QueryDTO) GetPageInfo(count int64) PageInfo {
	return PageInfo{
		Total:    count,
		Current:  q.Current,
		PageSize: q.PageSize,
	}
}

// PageInfo 分页信息
type PageInfo struct {
	Total    int64 `json:"total"`
	Current  int   `json:"current"`
	PageSize int   `json:"pageSize"`
}

type PageDTO[T any] struct {
	PageInfo PageInfo `json:"pageInfo"`
	Data     []*T     `json:"data"`
}

func BuildPageDTO[T any](pageInfo PageInfo, data []*T) *PageDTO[T] {
	var pageDTO PageDTO[T]
	pageDTO.PageInfo = pageInfo
	pageDTO.Data = data
	return &pageDTO
}
