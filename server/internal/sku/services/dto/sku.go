package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

type SkuDTO struct {
	dto.BaseDTO
	UserID            uint64    `json:"userId"`
	SourceSkuID       string    `json:"sourceSkuId"`
	PublishSkuID      string    `json:"publishSkuId"`
	PublishResourceID uint64    `json:"publishResourceId"`
	TaskID            uint64    `json:"taskId"`
	Name              string    `json:"name"`
	Status            string    `json:"status"`
	Url               string    `json:"url"`
	PublishTime       base.Time `json:"publishTime"`
}

type SkuPageParamDTO struct {
	page.Query `search:"-"`
	UserId     uint64 `search:"type:eq;table:sku;column:user_id"`
	// ShopName   string      `search:"type:eq;table:sku;column:shop_name"`
	SkuName string      `search:"type:eq;table:sku;column:sku_name"`
	_       string      `search:"type:order;table:sku;column:id;default:desc"`
	_       interface{} `search:"type:isNull;table:sku;column:deleted_at"`
	_       interface{} `search:"type:left;table:sku;join:resource;as:resource;on:id:publish_resource_id"`
	_       interface{} `search:"type:left;table:resource;join:shop;as:shop;on:resource_id:id"`
}

type SkuPageDTO struct {
	ID              uint64    `json:"id" select:"table:sku;column:id"`
	ResourceAccount string    `json:"resourceAccount" select:"table:resource;column:account;as:ResourceAccount"`
	ShopName        string    `json:"shopName" select:"table:shop;column:name;as:ShopName"`
	SkuName         string    `json:"skuName" select:"table:sku;column:name;as:SkuName"`
	Status          string    `json:"status" select:"table:sku;column:status"`
	PublishTime     base.Time `json:"publishTime" select:"table:sku;column:publish_time"`
	CreatedAt       base.Time `json:"createdAt" select:"table:sku;column:created_at"`
	UpdatedAt       base.Time `json:"updatedAt" select:"table:sku;column:updated_at"`
	Url             string    `json:"url" select:"table:sku;column:url"`
}
