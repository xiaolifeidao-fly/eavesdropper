package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
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
	SkuTaskItemStatusPending   *SkuTaskItemStatusEnum = &SkuTaskItemStatusEnum{"待发布", "pending", "blue"}
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
	case SkuTaskItemStatusPending.Value:
		return SkuTaskItemStatusPending
	}
	return nil
}

type SkuTaskItemDTO struct {
	dto.BaseDTO
	TaskId      uint64 `json:"taskId"`
	Url         string `json:"url"`
	Status      string `json:"status"`
	Remark      string `json:"remark"`
	SkuID       uint64 `json:"skuId"`
	Source      string `json:"source"`
	SourceSkuId string `json:"sourceSkuId"`
	Title       string `json:"title"`
}

type AddSkuTaskItemDTO struct {
	ID          uint64 `json:"id"`
	TaskId      uint64 `json:"taskId"`
	Url         string `json:"url"`
	Status      string `json:"status"`
	Remark      string `json:"remark"`
	Source      string `json:"source"`
	SkuID       uint64 `json:"skuId"`
	SourceSkuId string `json:"sourceSkuId"`
	Title       string `json:"title"`
}

var (
	STEP_PENDING  = "PENDING"
	STEP_DONE     = "DONE"
	STEP_ERROR    = "ERROR"
	STEP_INIT     = "INIT"
	STEP_ROLLBACK = "ROLLBACK"
)

type SkuTaskStepDTO struct {
	dto.BaseDTO
	TaskId       uint64 `json:"taskId"`
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

type SkuTaskStepLogDTO struct {
	dto.BaseDTO
	SkuTaskStepId uint64 `json:"skuTaskStepId"`
	Content       string `json:"content"`
}

type SkuTaskItemPageParamDTO struct {
	page.Query `search:"-"`
	ShopName   string `form:"shopName" search:"type:sLike;table:shop;column:name"`
	SkuName    string `form:"skuName" search:"type:sLike;table:sku_task_item;column:title"`
	Status     string `form:"status" search:"type:eq;table:sku_task_item;column:status"`
	_          string `search:"type:order;table:sku_task_item;column:id;default:desc"`
	_          any    `search:"type:isNull;table:sku_task_item;column:deleted_at"`
	_          any    `search:"type:left;table:sku_task_item;join:sku_task;on:id:task_id"`
	_          any    `search:"type:left;table:sku_task_item;join:sku;on:id:sku_id"`
	_          any    `search:"type:left;table:sku_task;join:resource;on:id:publish_resource_id"`
	_          any    `search:"type:left;table:resource;join:shop;on:resource_id:id"`
}

type SkuTaskItemPageDTO struct {
	ID              uint64     `json:"id" select:"table:sku_task_item;column:id;as:ID"`                              // 任务项ID
	TaskId          uint64     `json:"taskId" select:"table:sku_task_item;column:task_id;as:TaskId"`                 // 任务ID
	SourceSkuId     string     `json:"sourceSkuId" select:"table:sku_task_item;column:source_sku_id;as:SourceSkuId"` // 商品ID
	ResourceAccount string     `json:"account" select:"table:resource;column:account;as:ResourceAccount"`            // 资源账号
	ShopName        string     `json:"shopName" select:"table:shop;column:name;as:ShopName"`                         // 店铺名称
	SkuName         string     `json:"skuName" select:"table:sku_task_item;column:title;as:SkuName"`                 // 商品名称
	PublishTime     *base.Time `json:"publishTime" select:"table:sku_task_item;column:created_at;as:PublishTime"`    // 发布时间
	Status          string     `json:"status" select:"table:sku_task_item;column:status;as:Status"`                  // 状态
	SkuUrl          string     `json:"skuUrl" select:"table:sku_task_item;column:url;as:SkuUrl"`                     // 原商品链接
	PublishSkuId    string     `json:"publishSkuId" select:"table:sku;column:publish_sku_id;as:PublishSkuId"`        // 发布商品ID
}

type SkuTaskItemStepDTO struct {
	dto.BaseDTO
	StepKey      string `json:"stepKey"`
	TaskId       uint64 `json:"taskId"`
	Status       string `json:"status"`
	Code         string `json:"code"`
	GroupCode    string `json:"groupCode"`
	ValidateUrl  string `json:"validateUrl"`
	ResourceId   uint64 `json:"resourceId"`
	NeedNextSkip bool   `json:"needNextSkip"`
	Message      string `json:"message"`
}

type SkuTaskItemStepLogDTO struct {
	dto.BaseDTO
	SkuTaskStepId uint64 `json:"skuTaskStepId"`
	LogPath       string `json:"logPath"`
}
