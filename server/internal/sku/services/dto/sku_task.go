package dto

import (
	"errors"
	"server/common/base/dto"
)

type SkuTaskStatus string

const (
	SkuTaskStatusPending SkuTaskStatus = "pending"
	SkuTaskStatusRunning SkuTaskStatus = "running"
	SkuTaskStatusDone    SkuTaskStatus = "done"
	SkuTaskStatusFailed  SkuTaskStatus = "failed"
)

func (s SkuTaskStatus) Validate() error {
	if s == SkuTaskStatusPending ||
		s == SkuTaskStatusRunning ||
		s == SkuTaskStatusDone ||
		s == SkuTaskStatusFailed {
		return nil
	}
	return errors.New("status enum failed")
}

type SkuTaskDTO struct {
	dto.BaseDTO
	UserID            uint64 `json:"userId"`
	PublishResourceID uint64 `json:"publishResourceId"`
	Status            string `json:"status"`
	Remark            string `json:"remark"`
	Count             int    `json:"count"`
	PriceRate         string `json:"priceRate"`
	Source            string `json:"source"`
}

type PriceRangeConfigDTO struct {
	MinPrice        float64 `json:"minPrice" binding:"required"`        // 最小值
	MaxPrice        float64 `json:"maxPrice" binding:"required"`        // 最大值
	PriceMultiplier float64 `json:"priceMultiplier" binding:"required"` // 价格乘率
	FixedAddition   float64 `json:"fixedAddition"`                      // 加上
	RoundTo         string  `json:"roundTo"`                            // 保留值单位
}

type UpdateSkuTaskDTO struct {
	ID     uint64               `json:"id"`
	Status string               `json:"status"`
	Remark string               `json:"remark"`
	Items  []*AddSkuTaskItemDTO `json:"items"`
}
