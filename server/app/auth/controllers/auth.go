package controllers

import (
	"server/app/auth/common/constants"
	"server/app/auth/common/errors"
	"server/common/middleware/jwtauth"
	serverCommon "server/common/server/common"
	"server/common/server/controller"
	"server/internal/auth/services"
	"server/internal/auth/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Auth struct {
	controller.Controller
}

func NewAuthController(ctx *gin.Context) *Auth {
	return &Auth{Controller: *controller.NewController(ctx)}
}

// Login
// @Description 登录
// @Router /auth/login [post]
func Login(ctx *gin.Context) {
	authController := NewAuthController(ctx)
	var req dto.LoginReq

	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(errors.ErrLoginFailed)
		return
	}

	loginUserID := uint64(0)
	if err = services.Login(&req, &loginUserID); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	var token string
	if token, err = jwtauth.GenerateJwtToken(loginUserID); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(errors.ErrGenerateJwtToken)
		return
	}

	var resp dto.LoginResp
	resp.AccessToken = token

	// 登录成功记录登录日志
	var req2 dto.LoginRecordReq
	req2.From(loginUserID, serverCommon.GetClientIP(ctx), "deviceID") // TODO: 获取设备ID
	if err = services.RecordLoginLog(&req2); err != nil {
		authController.Logger.Errorf("RecordLoginLog failed, with error is %v", err)
		authController.Error(errors.ErrLoginRecord)
		return
	}

	authController.OK(resp)
}

// GetLoginUser
// @Description 获取登录用户信息
// @Router /auth/login-user [get]
func GetLoginUser(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var resp dto.LoginUserResp
	err := services.GetLoginUser(&resp)
	if err != nil {
		authController.Logger.Errorf("GetLoginUser failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}
	authController.OK(resp)
}

// Logout
// @Description 登出
// @Router /auth/logout [post]
func Logout(ctx *gin.Context) {
	authController := NewAuthController(ctx)
	clearTokenAndCookie(ctx)
	authController.OK(constants.LogoutSuccess)
}

// clearTokenAndCookie 清除token和cookie
func clearTokenAndCookie(c *gin.Context) {
	c.SetCookie(serverCommon.AuthHeader, "", -1, "/", "", false, true)
}
