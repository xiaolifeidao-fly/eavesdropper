package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
)

type ResourceDTO struct {
	dto.BaseDTO
	UserID         uint64     `json:"userId"`
	Source         string     `json:"source"`
	Account        string     `json:"account"`
	Tag            string     `json:"tag"`
	Remark         string     `json:"remark"`
	ExpirationDate *base.Time `json:"expirationDate"`
}

var (
	EXPIRATION = ResourceStatusEnum{"过期", "expiration", "red"}
	ONLINE     = ResourceStatusEnum{"在线", "onLine", "green"}
	OFFLINE    = ResourceStatusEnum{"离线", "offline", "default"}
)

type ResourceStatusEnum struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}

type AddResourceDTO struct {
	UserID uint64 `json:"userId"`
	Source string `json:"source"`
	Tag    string `json:"tag"`
	Remark string `json:"remark"`
}

// ResourcePageParamDTO 资源分页参数DTO
type ResourcePageParamDTO struct {
	page.Query          `search:"-"`
	UserID              uint64      `search:"type:eq;table:resource;column:user_id"`
	Source              string      `search:"type:eq;table:resource;column:source"`
	Account             string      `search:"type:sLike;table:resource;column:account"`
	StartExpirationDate string      `search:"type:gte;table:resource;column:expiration_date"`
	EndExpirationDate   string      `search:"type:lte;table:resource;column:expiration_date"`
	_                   string      `search:"type:order;table:resource;column:id;default:desc"`
	_                   interface{} `search:"type:isNull;table:resource;column:deleted_at"`
}

// ResourcePageDTO 资源分页DTO
type ResourcePageDTO struct {
	ID             uint64     `json:"id" select:"table:resource;column:id"`
	UserID         uint64     `json:"userId" select:"table:resource;column:user_id"`
	Account        string     `json:"account" select:"table:resource;column:account"`
	Source         string     `json:"source" select:"table:resource;column:source"`
	Tag            string     `json:"tag" select:"table:resource;column:tag"`
	CreatedBy      string     `json:"createdBy" select:"table:resource;column:created_by"`
	UpdatedAt      base.Time  `json:"updatedAt" select:"table:resource;column:updated_at"`
	Remark         string     `json:"remark" select:"table:resource;column:remark"`
	ExpirationDate *base.Time `json:"expirationDate" select:"table:resource;column:expiration_date"`
	Nick           string     `json:"nick"`
}

// ResourceBindDTO 绑定资源DTO
type ResourceBindDTO struct {
	ID          uint64 `json:"id"`
	DisplayNick string `json:"displayNick"`
	Nick        string `json:"nick"`
	UserNumId   uint64 `json:"userNumId"`
}
