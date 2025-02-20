package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

var (
	Effective    = ShopStatusEnum{"有效", "effective", "green"}
	LoseEfficacy = ShopStatusEnum{"无效", "loseEffective", "red"}
)

type ShopStatusEnum struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}

type ShopDTO struct {
	dto.BaseDTO
	UserID     uint64 `json:"userId"`
	ResourceID uint64 `json:"resourceId"`
	Name       string `json:"name"`
	ShopID     uint64 `json:"shopId"`
	Remark     string `json:"remark"`
	Status     string `json:"status"`
}

// ShopPageParamDTO 店铺分页参数DTO
type ShopPageParamDTO struct {
	page.Query `search:"-"`
	UserID     uint64      `search:"type:eq;table:shop;column:user_id"`
	Account    string      `search:"type:sLike;table:resource;column:account"`
	_          string      `search:"type:order;table:shop;column:id;default:desc"`
	_          interface{} `search:"type:isNull;table:shop;column:deleted_at"`
	_          interface{} `search:"type:left;table:shop;join:resource;as:resource;on:id:resource_id"`
}

// ShopPageDTO 店铺分页DTO
type ShopPageDTO struct {
	ID         uint64    `json:"id" select:"table:shop;column:id"`
	UserID     uint64    `json:"userId" select:"table:shop;column:user_id"`
	ResourceID uint64    `json:"resourceId" select:"table:shop;column:resource_id"`
	Account    string    `json:"account" select:"table:resource;column:account"`
	Name       string    `json:"name" select:"table:shop;column:name"`
	Remark     string    `json:"remark" select:"table:shop;column:remark"`
	CreatedBy  string    `json:"createdBy" select:"table:shop;column:created_by"`
	UpdatedAt  base.Time `json:"updatedAt" select:"table:shop;column:updated_at"`
	Status     string    `json:"status" select:"table:shop;column:status"`
}

// ShopSyncDTO 同步店铺DTO
type ShopSyncDTO struct {
	ID         uint64 `json:"id"`
	ResourceID uint64 `json:"resourceId"`
	Account    string `json:"account"`
	Name       string `json:"name"`
	ShopID     uint64 `json:"shopId"`
	Status     string `json:"status"`
}
