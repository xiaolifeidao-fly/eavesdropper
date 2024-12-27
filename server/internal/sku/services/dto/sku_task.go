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
}

type UpdateSkuTaskDTO struct {
	ID     uint64               `json:"id"`
	Status string               `json:"status"`
	Remark string               `json:"remark"`
	Items  []*AddSkuTaskItemDTO `json:"items"`
}
