package dto

import (
	"errors"
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

type SkuTaskStatusEnum struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}

var (
	SkuTaskStatusPending *SkuTaskStatusEnum = &SkuTaskStatusEnum{"待执行", "pending", "blue"}
	SkuTaskStatusRunning *SkuTaskStatusEnum = &SkuTaskStatusEnum{"执行中", "running", "green"}
	SkuTaskStatusDone    *SkuTaskStatusEnum = &SkuTaskStatusEnum{"已完成", "done", "green"}
	SkuTaskStatusFailed  *SkuTaskStatusEnum = &SkuTaskStatusEnum{"失败", "failed", "red"}
)

func (s SkuTaskStatusEnum) Validate() error {
	if s == *SkuTaskStatusPending ||
		s == *SkuTaskStatusRunning ||
		s == *SkuTaskStatusDone ||
		s == *SkuTaskStatusFailed {
		return nil
	}
	return errors.New("status enum failed")
}

func GetSkuTaskStatusEnum(status string) *SkuTaskStatusEnum {
	switch status {
	case SkuTaskStatusPending.Value:
		return SkuTaskStatusPending
	case SkuTaskStatusRunning.Value:
		return SkuTaskStatusRunning
	case SkuTaskStatusDone.Value:
		return SkuTaskStatusDone
	case SkuTaskStatusFailed.Value:
		return SkuTaskStatusFailed
	}
	return nil
}

func GetSkuTaskStatusEnums() []*SkuTaskStatusEnum {
	return []*SkuTaskStatusEnum{SkuTaskStatusPending, SkuTaskStatusRunning, SkuTaskStatusDone, SkuTaskStatusFailed}
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

type SkuTaskPageParamDTO struct {
	page.Query `search:"-"`
	UserId     uint64 `search:"type:eq;table:sku_task;column:user_id"`
	Account    string `search:"type:eq;table:resource;column:account"`
	Source     string `search:"type:eq;table:sku_task;column:source"`
	Status     string `search:"type:eq;table:sku_task;column:status"`
	_          string `search:"type:order;table:sku_task;column:id;default:desc"`
	_          any    `search:"type:isNull;table:sku_task;column:deleted_at"`
	_          any    `search:"type:isNull;table:shop;column:deleted_at"`
	_          any    `search:"type:left;table:sku_task;join:auth_user;as:user;on:id:user_id"`
	_          any    `search:"type:left;table:sku_task;join:resource;as:resource;on:id:publish_resource_id"`
	_          any    `search:"type:left;table:resource;join:shop;as:shop;on:resource_id:id"`
}

type SkuTaskPageDTO struct {
	ID              uint64    `json:"id" select:"table:sku_task;column:id"`
	ResourceID      uint64    `json:"resourceId" select:"table:sku_task;column:publish_resource_id;as:ResourceID"`
	ResourceAccount string    `json:"resourceAccount" select:"table:resource;column:account;as:ResourceAccount"`
	ShopName        string    `json:"shopName" select:"table:shop;column:name;as:ShopName"`
	Status          string    `json:"status" select:"table:sku_task;column:status"`
	Source          string    `json:"source" select:"table:sku_task;column:source"`
	Count           int       `json:"count" select:"table:sku_task;column:count"`
	CreatedBy       string    `json:"createdBy" select:"table:user;column:nickname;as:CreatedBy"`
	CreatedAt       base.Time `json:"createdAt" select:"table:sku_task;column:created_at"`
	SuccessCount    int       `json:"successCount"`
	FailedCount     int       `json:"failedCount"`
	CancelCount     int       `json:"cancelCount"`
	ExistenceCount  int       `json:"existenceCount"`
}
