package dto

import (
	"time"
)

type DTO interface {
	GetId() int
}

type BaseDTO struct {
	Id          int       `json:"id"`
	Active      int8      `json:"active"`
	CreatedTime time.Time `json:"createdTime"`
	CreatedBy   string    `json:"createdBy"`
	UpdatedTime time.Time `json:"updatedTime"`
	UpdatedBy   string    `json:"updatedBy"`
}

func (dto *BaseDTO) GetId() int {
	return dto.Id
}

type QueryDTO struct {
	BaseDTO
	PageIndex int `json:"pageIndex"`
	PageSize  int `json:"pageSize"`
}

type PageDTO[T any] struct {
	Total int  `json:"total"`
	Data  []*T `json:"data"`
}

func BuildPage[T any](total int, data []*T) *PageDTO[T] {
	var pageDTO PageDTO[T]
	pageDTO.Total = total
	pageDTO.Data = data
	return &pageDTO
}
