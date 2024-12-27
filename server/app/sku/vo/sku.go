package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

// SkuAddReq 添加sku请求
type SkuAddReq struct {
	PublishResourceID uint64    `json:"publishResourceId" binding:"required"`
	TaskID            uint64    `json:"taskId" binding:"required"`
	Name              string    `json:"name" binding:"required"`
	SourceSkuID       string    `json:"sourceSkuId" binding:"required"`
	PublishSkuID      string    `json:"publishSkuId" binding:"required"`
	Status            string    `json:"status" binding:"required"`
	Url               string    `json:"url" binding:"required"`
	PublishTime       base.Time `json:"publishTime" binding:"required"`
}

type CheckSkuExistenceReq struct {
	PublishResourceID uint64 `form:"publishResourceId" binding:"required"`
	SourceSkuID       string `form:"sourceSkuId" binding:"required"`
}

// SkuPageReq sku分页请求
type SkuPageReq struct {
	page.Query
	vo.BaseVO
	ShopName string `form:"shopName"` // 店铺名称
	SkuName  string `form:"skuName"`  // 商品名称
}

// SkuPageResp sku分页响应
type SkuPageResp struct {
	ID              uint64    `json:"id"`              // 商品ID
	ResourceAccount string    `json:"resourceAccount"` // 资源账号
	ShopName        string    `json:"shopName"`        // 店铺名称
	SkuName         string    `json:"skuName"`         // 商品名称
	Status          string    `json:"status"`          // 状态
	PublishTime     base.Time `json:"publishTime"`     // 发布时间
	CreatedAt       base.Time `json:"createdAt"`       // 创建时间
	Url             string    `json:"url"`             // 商品链接
}
