package dto

import "server/internal/auth/models"

// LoginReq 登录请求
type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginUserResp 登录用户信息
type LoginUserResp struct {
	ID       uint64 `json:"id"`
	Nickname string `json:"nickname"`
	Username string `json:"username"`
}

func (resp *LoginUserResp) FromUser(dbUser *models.User) {
	resp.ID = dbUser.ID
	resp.Nickname = dbUser.Nickname
	resp.Username = dbUser.Username
}
