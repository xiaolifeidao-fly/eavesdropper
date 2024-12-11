package controllers

import (
	"server/common/middleware/application"
	serverCommon "server/common/server/common"
	"server/common/server/controller"
	"server/internal/auth/services"
	"server/internal/auth/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	LogoutSuccess   = "登出成功"
	RegisterSuccess = "注册成功"
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
		authController.Error(err)
		return
	}

	// 验证登录验证码
	if application.ApplicationConfig.Mode != "dev" {
		if err = services.CheckCaptcha(req.CaptchaID, req.Captcha); err != nil {
			authController.Logger.Errorf("CheckCaptcha failed, with error is %v", err)
			authController.Error(err)
			return
		}
	}

	// 获取客户端IP
	req.LoginIP = serverCommon.GetClientIP(ctx)
	req.DeviceID = "deviceID" // TODO: 获取设备ID

	var resp dto.LoginResp
	if err = services.Login(&req, &resp); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(err)
		return
	}

	authController.OK(resp)
}

// Register
// @Description 注册
// @Router /auth/register [post]
func Register(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var req dto.RegisterReq
	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("Register failed, with error is %v", err)
		authController.Error(err)
		return
	}

	// 验证登录验证码
	if application.ApplicationConfig.Mode != "dev" {
		if err = services.CheckCaptcha(req.CaptchaID, req.Captcha); err != nil {
			authController.Logger.Errorf("CheckCaptcha failed, with error is %v", err)
			authController.Error(err)
			return
		}
	}

	if err = services.Register(&req); err != nil {
		authController.Logger.Errorf("Register failed, with error is %v", err)
		authController.Error(err)
		return
	}

	authController.OK(RegisterSuccess)
}

// GetCaptcha
// @Description 获取验证码
// @Router /auth/captcha [get]
func GetCaptcha(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var resp dto.CaptchaResp
	if err := services.GetCaptcha(&resp); err != nil {
		authController.Logger.Errorf("GetCaptcha failed, with error is %v", err)
		authController.Error(err)
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
		authController.Error(err)
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
		authController.Error(err)
		return
	}

	authController.OK(LogoutSuccess)
}
