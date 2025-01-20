package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

type ResourceResp struct {
	ID        uint64    `json:"id"`        // 资源ID
	UserID    uint64    `json:"userId"`    // 用户ID
	Account   string    `json:"account"`   // 资源账号
	Source    string    `json:"source"`    // 资源来源
	Tag       string    `json:"tag"`       // 资源标签
	Remark    string    `json:"remark"`    // 备注
	UpdatedBy uint64    `json:"updatedBy"` // 更新人
	UpdatedAt base.Time `json:"updatedAt"` // 更新时间
	CreatedBy uint64    `json:"createdBy"` // 创建人
	CreatedAt base.Time `json:"createdAt"` // 创建时间
}

// AddResourceReq 添加资源请求
type AddResourceReq struct {
	UserID uint64 `json:"userId"`
	Source string `json:"source" binding:"required"`
	Tag    string `json:"tag" binding:"required"`
	Remark string `json:"remark"`
}

// DeleteResourceReq 删除资源请求
type DeleteResourceReq struct {
	ID uint64 `uri:"id" binding:"required"`
}

// UpdateResourceReq 修改资源请求
type UpdateResourceReq struct {
	ID     uint64 `uri:"id" binding:"required"`
	Tag    string `json:"tag" binding:"required"`
	Remark string `json:"remark"`
}

// GetResourceReq 获取资源请求
type GetResourceReq struct {
	ID uint64 `uri:"id" binding:"required"`
}

// ResourcePageReq 资源分页请求
type ResourcePageReq struct {
	page.Query
	vo.BaseVO
	UserID  uint64 `form:"userId"`
	Source  string `form:"source"`
	Tag     string `form:"tag"`
	Account string `form:"account"`
}

// ResourcePageResp 资源分页响应
type ResourcePageResp struct {
	ID        uint64          `json:"id"`        // 资源ID
	UserID    uint64          `json:"userId"`    // 用户ID
	Account   string          `json:"account"`   // 资源账号
	Source    vo.LabelValueVO `json:"source"`    // 资源来源
	Tag       vo.LabelValueVO `json:"tag"`       // 资源标签
	UpdatedAt base.Time       `json:"updatedAt"` // 更新时间
	CreatedBy string          `json:"createdBy"` // 创建人
	Remark    string          `json:"remark"`    // 备注
}
