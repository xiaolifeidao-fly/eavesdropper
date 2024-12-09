package controllers

import (
	"server/app/auth/common/errors"
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
		authController.Error(errors.ErrLoginFailed.Error())
		return
	}

	// 获取客户端IP
	req.LoginIP = serverCommon.GetClientIP(ctx)
	req.DeviceID = "deviceID" // TODO: 获取设备ID

	var resp dto.LoginResp
	if err = services.Login(&req, &resp); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(errors.ErrLoginFailed.Error())
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
		authController.Error(errors.ErrGetLoginUserFailed.Error())
		return
	}
	authController.OK(resp)
}

// Logout
// @Description 登出
// @Router /auth/logout [post]
func Logout(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	if err := services.Logout(); err != nil {
		authController.Logger.Errorf("Logout failed, with error is %v", err)
		authController.Error(errors.ErrLogoutFailed.Error())
		return
	}

	authController.OK(errors.ErrLogoutSuccess.Error())
}
