package vo

import "time"

type VO interface {
	GetId() int
}
type Base struct {
	Id          int       `json:"id"`
	Active      int8      `json:"active"`
	CreatedTime time.Time `json:"createdTime"`
	CreatedBy   string    `json:"createdBy"`
	UpdatedTime time.Time `json:"updatedTime"`
	UpdatedBy   string    `json:"updatedBy"`
}

func (dto *Base) GetId() int {
	return dto.Id
}

type Query struct {
	Base
	PageIndex int `json:"pageIndex"`
	PageSize  int `json:"pageSize"`
}

func (dto *Query) GetId() int {
	return dto.Id
}

type Page[V any] struct {
	Total int  `json:"total"`
	Data  []*V `json:"data"`
}

func BuildPage[V any](total int, data []*V) *Page[V] {
	var page Page[V]
	page.Total = total
	page.Data = data
	return &page
}
