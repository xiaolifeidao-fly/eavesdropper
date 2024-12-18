package controllers

import (
	"server/app/auth/vo"
	"server/common"
	"server/common/converter"
	"server/common/logger"
	serverCommon "server/common/server/common"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/auth/services"
	"server/internal/auth/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	RegisterSuccess           = "注册成功"
	LogoutSuccess             = "登出成功"
	UpdateUserInfoSuccess     = "更新个人信息成功"
	ModifyUserPasswordSuccess = "修改密码成功"
)

func LoadAuthRouter(router *gin.RouterGroup) {
	r := router.Group("/auth")
	{
		r.POST("/login", Login)
		r.POST("/register", Register)
		r.GET("/captcha", GetCaptcha)
		r.Use(middleware.Authorization()).GET("/login-user", GetLoginUser)
		r.Use(middleware.Authorization()).POST("/logout", Logout)
		r.Use(middleware.Authorization()).PUT("/user-info", UpdateAuthUserInfo)
		r.Use(middleware.Authorization()).PUT("/modify-password", ModifyAuthUserPassword)
	}
}

// Login
// @Description 登录
// @Router /auth/login [post]
func Login(ctx *gin.Context) {
	var err error

	var req vo.LoginReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("Login failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	// 获取客户端IP
	loginDTO := converter.ToDTO[dto.LoginDTO](&req)
	loginDTO.LoginIP = serverCommon.GetClientIP(ctx)
	loginDTO.LoginDeviceID = "deviceID" // TODO: 获取设备ID

	var loginToken string
	if loginToken, err = services.Login(loginDTO); err != nil {
		logger.Errorf("Login failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var resp vo.LoginResp
	resp.AccessToken = loginToken
	controller.OK(ctx, resp)
}

// Register
// @Description 注册
// @Router /auth/register [post]
func Register(ctx *gin.Context) {
	var err error

	var req vo.RegisterReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("Register failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	registerDTO := converter.ToDTO[dto.RegisterDTO](&req)
	if err = services.Register(registerDTO); err != nil {
		logger.Errorf("Register failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, RegisterSuccess)
}

// GetCaptcha
// @Description 获取验证码
// @Router /auth/captcha [get]
func GetCaptcha(ctx *gin.Context) {
	var err error

	captchaDTO, err := services.GetCaptcha()
	if err != nil {
		logger.Errorf("GetCaptcha failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	resp := converter.ToVO[vo.CaptchaResp](captchaDTO)
	controller.OK(ctx, resp)
}

// GetLoginUser
// @Description 获取登录用户信息
// @Router /auth/login-user [get]
func GetLoginUser(ctx *gin.Context) {
	var err error

	userID := common.GetLoginUserID()
	userLoginInfoDTO, err := services.GetLoginUser(userID)
	if err != nil {
		logger.Errorf("GetLoginUser failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var resp vo.LoginUserResp
	converter.Copy(&resp, userLoginInfoDTO)
	controller.OK(ctx, resp)
}

// Logout
// @Description 登出
// @Router /auth/logout [post]
func Logout(ctx *gin.Context) {
	var err error

	userID := common.GetLoginUserID()
	if err = services.Logout(userID); err != nil {
		logger.Errorf("Logout failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, LogoutSuccess)
}

// UpdateAuthUser
// @Description 更新个人信息
// @Router /auth/user-info [put]
func UpdateAuthUserInfo(ctx *gin.Context) {
	var err error

	var req vo.UpdateAuthUserReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("UpdateAuthUser failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	authUserUpdateDTO := converter.ToDTO[dto.AuthUserUpdateDTO](&req)
	if err = services.UpdateAuthUser(authUserUpdateDTO); err != nil {
		logger.Errorf("UpdateAuthUser failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, UpdateUserInfoSuccess)
}

// ModifyAuthUserPassword
// @Description 修改密码
// @Router /auth/modify-password [put]
func ModifyAuthUserPassword(ctx *gin.Context) {
	var err error

	var req vo.ModifyAuthUserPasswordReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("ModifyAuthUserPassword failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	if err = services.ModifyAuthUserPassword(req.OldPassword, req.NewPassword); err != nil {
		logger.Errorf("ModifyAuthUserPassword failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, ModifyUserPasswordSuccess)
}
