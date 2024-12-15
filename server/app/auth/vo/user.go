package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

// UserPageReq 用户分页请求
type UserPageReq struct {
	page.Query
	vo.BaseVO
	Mobile string `form:"mobile"`
}

// UserPageResp 用户分页响应
type UserPageResp struct {
	ID          uint64    `json:"id"`
	Nickname    string    `json:"nickname"`
	Mobile      string    `json:"mobile"`
	LastLoginAt base.Time `json:"lastLoginAt"`
	UpdatedAt   base.Time `json:"updatedAt"`
}
