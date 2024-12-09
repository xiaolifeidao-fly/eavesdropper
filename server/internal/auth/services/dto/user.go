package dto

import (
	"server/common"
	"server/common/base"
	"server/internal/auth/models"
)

// UserAddReq 添加用户请求
type UserAddReq struct {
	Nickname string `json:"nickname" validate:"required"`
	Username string `json:"username" validate:"required"`
}

func (r *UserAddReq) ToUser(user *models.User) {
	loginUserId := common.GetLoginUserID()

	user.Nickname = r.Nickname
	user.Username = r.Username
	user.CreatedBy = loginUserId
	user.UpdatedBy = loginUserId
}

// UserDeleteReq 删除用户请求
type UserDeleteReq struct {
	ID uint64 `uri:"id" validate:"required"`
}

func (r *UserDeleteReq) ToUser(user *models.User) {
	user.ID = r.ID
}

// UserUpdateReq 更新用户请求
type UserUpdateReq struct {
	ID   uint64 `uri:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
}

func (r *UserUpdateReq) ToUser(user *models.User, loginUserId uint64) {
	user.Nickname = r.Name
	user.UpdatedBy = loginUserId
}

// UserGetReq 获取用户请求
type UserGetReq struct {
	ID uint64 `uri:"id" validate:"required"`
}

// UserGetResp 获取用户响应
type UserGetResp struct {
	ID       uint64 `json:"id"`
	Nickname string `json:"nickname"`
}

func (r *UserGetResp) FromUser(user *models.User) {
	r.ID = user.ID
	r.Nickname = user.Nickname
}

// UserPageReq 分页获取用户请求
type UserPageReq struct {
	Nickname  string      `form:"nickname" search:"type:sLike;table:auth_user;column:nickname"`
	Username  string      `form:"username" search:"type:eq;table:auth_user;column:username"`
	_         string      `search:"type:order;table:auth_user;column:id;default:desc"`
	_         interface{} `search:"type:isNull;table:auth_user;column:deleted_at"`
	base.Page `search:"-"`
}

// UserPageResp 分页获取用户响应
type UserPageResp struct {
	ID        int       `json:"id" select:"table:auth_user;column:id"`
	Uid       string    `json:"uid" select:"table:auth_user;column:uid"`
	Nickname  string    `json:"nickname" select:"table:auth_user;column:nickname"`
	Username  string    `json:"username" select:"table:auth_user;column:username"`
	UpdatedAt base.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
}

// UserResetPasswordReq 重置用户密码请求
type UserResetPasswordReq struct {
	ID uint64 `uri:"id" validate:"required"`
}

func (r *UserResetPasswordReq) ToUser(user *models.User, password string) {
	loginUserId := common.GetLoginUserID()

	user.UpdatedBy = loginUserId
}

// UserGetListReq 获取用户列表请求
type UserGetListReq struct {
	Username string      `form:"username" search:"type:sLike;table:auth_user;column:username"`
	_        interface{} `search:"type:isNull;table:auth_user;column:deleted_at"`
}

// UserGetListResp 获取用户列表响应
type UserGetListResp struct {
	ID        uint64    `json:"id" select:"table:auth_user;column:id"`
	Uid       string    `json:"uid" select:"table:auth_user;column:uid"`
	Nickname  string    `json:"nickname" select:"table:auth_user;column:nickname"`
	Username  string    `json:"username" select:"table:auth_user;column:username"`
	UpdatedAt base.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
}
