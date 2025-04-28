package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

// ShopDeleteReq 删除店铺请求
type ShopDeleteReq struct {
	ID uint64 `uri:"id"`
}

// ShopPageReq 店铺分页请求
type ShopPageReq struct {
	page.Query
	vo.BaseVO
	UserID  uint64 `form:"userId"`
	Account string `form:"account"`
}

// ShopPageResp 店铺分页响应
type ShopPageResp struct {
	ID             uint64          `json:"id"`             // 资源ID
	UserID         uint64          `json:"userId"`         // 用户ID
	ResourceID     uint64          `json:"resourceId"`     // 资源ID
	Account        string          `json:"account"`        // 资源账号
	Name           string          `json:"name"`           // 店铺名称
	Remark         string          `json:"remark"`         // 备注
	UpdatedAt      base.Time       `json:"updatedAt"`      // 更新时间
	CreatedBy      string          `json:"createdBy"`      // 创建人
	Status         vo.LabelValueVO `json:"status"`         // 状态
	ExpirationDate *base.Time      `json:"expirationDate"` // 资源过期时间
}

// ShopSyncReq 同步店铺请求
type ShopSyncReq struct {
	ID         uint64 `uri:"id"`
	ResourceID uint64 `json:"resourceId"`
	Account    string `json:"account"`
	Name       string `json:"name"`
	ShopID     uint64 `json:"shopId"`
	Status     string `json:"status"`
}

// ShopBindAuthCodeReq 绑定激活码请求
type ShopBindAuthCodeReq struct {
	ID    uint64 `uri:"id"`
	Token string `json:"token"`
}
