package dto

import (
	"server/common"
	"server/common/base"
	"server/common/encryption"
	"server/internal/auth/common/constants"
	"server/internal/auth/models"
)

// UserAddReq 添加用户请求
type UserAddReq struct {
	Name    string `json:"name" validate:"required"`
	Account string `json:"account" validate:"required"`
}

func (r *UserAddReq) ToUser(user *models.User) {
	loginUserId := common.GetLoginUserID()

	user.Uid = common.SnowflakeUtil.NextValString()
	user.Name = r.Name
	user.Account = r.Account
	user.Secret = encryption.GenerateSecret(constants.UserPasswordSecretLength)
	password := encryption.GeneratePassword(constants.UserPasswordLength)
	encryptionPassword := encryption.Md5Password2(password)
	user.Password = encryption.Encryption(user.Secret, encryptionPassword)
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
	user.Name = r.Name
	user.UpdatedBy = loginUserId
}

// UserGetReq 获取用户请求
type UserGetReq struct {
	ID uint64 `uri:"id" validate:"required"`
}

// UserGetResp 获取用户响应
type UserGetResp struct {
	ID   uint64 `json:"id"`
	Name string `json:"name"`
}

func (r *UserGetResp) FromUser(user *models.User) {
	r.ID = user.ID
	r.Name = user.Name
}

// UserPageReq 分页获取用户请求
type UserPageReq struct {
	Name      string      `form:"name" search:"type:sLike;table:auth_user;column:name"`
	Account   string      `form:"account" search:"type:eq;table:auth_user;column:account"`
	_         string      `search:"type:order;table:auth_user;column:id;default:desc"`
	_         interface{} `search:"type:isNull;table:auth_user;column:deleted_at"`
	base.Page `search:"-"`
}

// UserPageResp 分页获取用户响应
type UserPageResp struct {
	ID        int       `json:"id" select:"table:auth_user;column:id"`
	Uid       string    `json:"uid" select:"table:auth_user;column:uid"`
	Name      string    `json:"name" select:"table:auth_user;column:name"`
	Account   string    `json:"account" select:"table:auth_user;column:account"`
	UpdatedAt base.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
}

// UserResetPasswordReq 重置用户密码请求
type UserResetPasswordReq struct {
	ID uint64 `uri:"id" validate:"required"`
}

func (r *UserResetPasswordReq) ToUser(user *models.User, password string) {
	loginUserId := common.GetLoginUserID()

	user.Secret = encryption.GenerateSecret(constants.UserPasswordSecretLength)
	encryptionPassword := encryption.Md5Password2(password)
	user.Password = encryption.Encryption(user.Secret, encryptionPassword)
	user.UpdatedBy = loginUserId
}

// UserGetListReq 获取用户列表请求
type UserGetListReq struct {
	Account string      `form:"account" search:"type:sLike;table:auth_user;column:account"`
	_       interface{} `search:"type:isNull;table:auth_user;column:deleted_at"`
}

// UserGetListResp 获取用户列表响应
type UserGetListResp struct {
	ID        uint64    `json:"id" select:"table:auth_user;column:id"`
	Uid       string    `json:"uid" select:"table:auth_user;column:uid"`
	Name      string    `json:"name" select:"table:auth_user;column:name"`
	Account   string    `json:"account" select:"table:auth_user;column:account"`
	UpdatedAt base.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
}
