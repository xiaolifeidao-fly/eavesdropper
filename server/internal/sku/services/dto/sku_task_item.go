package dto

import (
	"server/common/base/dto"
)

// type SkuTaskItemStatus string

// const (
// 	SkuTaskItemStatusSuccess   SkuTaskItemStatus = "success"   // 成功
// 	SkuTaskItemStatusFailed    SkuTaskItemStatus = "failed"    // 失败
// 	SkuTaskItemStatusCancel    SkuTaskItemStatus = "cancel"    // 取消
// 	SkuTaskItemStatusExistence SkuTaskItemStatus = "existence" // 已存在
// )

// func (s SkuTaskItemStatus) Validate() error {
// 	if s == SkuTaskItemStatusSuccess ||
// 		s == SkuTaskItemStatusFailed ||
// 		s == SkuTaskItemStatusCancel ||
// 		s == SkuTaskItemStatusExistence {
// 		return nil
// 	}
// 	return errors.New("status enum failed")
// }

type SkuTaskItemStatusEnum struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}

var (
	SkuTaskItemStatusSuccess   *SkuTaskItemStatusEnum = &SkuTaskItemStatusEnum{"成功", "success", "green"}
	SkuTaskItemStatusFailed    *SkuTaskItemStatusEnum = &SkuTaskItemStatusEnum{"失败", "failed", "red"}
	SkuTaskItemStatusCancel    *SkuTaskItemStatusEnum = &SkuTaskItemStatusEnum{"取消", "cancel", "gray"}
	SkuTaskItemStatusExistence *SkuTaskItemStatusEnum = &SkuTaskItemStatusEnum{"已存在", "existence", "orange"}
)

func GetSkuTaskItemStatusEnumByValue(value string) *SkuTaskItemStatusEnum {
	switch value {
	case SkuTaskItemStatusSuccess.Value:
		return SkuTaskItemStatusSuccess
	case SkuTaskItemStatusFailed.Value:
		return SkuTaskItemStatusFailed
	case SkuTaskItemStatusCancel.Value:
		return SkuTaskItemStatusCancel
	case SkuTaskItemStatusExistence.Value:
		return SkuTaskItemStatusExistence
	}
	return nil
}

type SkuTaskItemDTO struct {
	dto.BaseDTO
	TaskId uint64 `json:"taskId"`
	Url    string `json:"url"`
	Status string `json:"status"`
	Remark string `json:"remark"`
	SkuID  uint64 `json:"skuId"`
	Source string `json:"source"`
}

type AddSkuTaskItemDTO struct {
	TaskId uint64 `json:"taskId"`
	Url    string `json:"url"`
	Status string `json:"status"`
	Remark string `json:"remark"`
	Source string `json:"source"`
}

var (
	STEP_PENDING = "PENDING"
	STEP_DONE    = "DONE"
	STEP_ERROR   = "ERROR"
	STEP_INIT    = "INIT"
)

type SkuTaskStepDTO struct {
	dto.BaseDTO
	StepKey      string `json:"StepKey"`
	Status       string `json:"status"`
	Code         string `json:"code"`
	GroupCode    string `json:"groupCode"`
	ValidateUrl  string `json:"validateUrl"`
	ResourceId   uint64 `json:"resourceId"`
	Message      string `json:"message"`
	NeedNextSkip bool   `json:"needNextSkip"`
}

type SkuTaskItemStatusCountDTO struct {
	TaskID uint64 `json:"taskId"`
	Status string `json:"status"`
	Count  int    `json:"count"`
}
