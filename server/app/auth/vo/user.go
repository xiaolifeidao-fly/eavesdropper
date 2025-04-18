package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

// UserAddReq 用户添加请求
type UserAddReq struct {
	vo.BaseVO
	Mobile   string `json:"mobile" binding:"required"`
	Nickname string `json:"nickname" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// DeleteUserReq 删除用户请求
type DeleteUserReq struct {
	vo.BaseVO
	ID uint64 `uri:"id" binding:"required"`
}

// UserUpdateReq 更新用户请求
type UserUpdateReq struct {
	vo.BaseVO
	ID       uint64 `uri:"id" binding:"required"`
	Nickname string `json:"nickname" binding:"required"`
}

// GetUserReq 获取用户请求
type GetUserReq struct {
	vo.BaseVO
	ID uint64 `uri:"id" binding:"required"`
}

// GetUserInfoResp 获取用户信息响应
type GetUserInfoResp struct {
	ID          uint64    `json:"id"`
	Nickname    string    `json:"nickname"`
	Mobile      string    `json:"mobile"`
	LastLoginAt base.Time `json:"lastLoginAt"`
	UpdatedAt   base.Time `json:"updatedAt"`
}

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
