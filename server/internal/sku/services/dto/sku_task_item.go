package dto

import (
	"errors"
	"server/common/base/dto"
)

type SkuTaskItemStatus string

const (
	SkuTaskItemStatusSuccess SkuTaskItemStatus = "success" // 成功
	SkuTaskItemStatusFailed  SkuTaskItemStatus = "failed"  // 失败
	SkuTaskItemStatusCancel  SkuTaskItemStatus = "cancel"  // 取消
)

func (s SkuTaskItemStatus) Validate() error {
	if s == SkuTaskItemStatusSuccess ||
		s == SkuTaskItemStatusFailed ||
		s == SkuTaskItemStatusCancel {
		return nil
	}
	return errors.New("status enum failed")
}

type SkuTaskItemDTO struct {
	dto.BaseDTO
	TaskId uint64 `json:"taskId"`
	Url    string `json:"url"`
	Status string `json:"status"`
	Remark string `json:"remark"`
}

type AddSkuTaskItemDTO struct {
	TaskId uint64 `json:"taskId"`
	Url    string `json:"url"`
	Status string `json:"status"`
	Remark string `json:"remark"`
}
