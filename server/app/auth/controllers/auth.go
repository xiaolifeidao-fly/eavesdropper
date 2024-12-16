package controllers

import (
	"server/app/auth/vo"
	"server/common"
	"server/common/converter"
	serverCommon "server/common/server/common"
	"server/common/server/controller"
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
	var req vo.LoginReq

	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error("系统错误")
		return
	}

	// 获取客户端IP
	loginDTO := converter.ToDTO[dto.LoginDTO](&req)
	loginDTO.LoginIP = serverCommon.GetClientIP(ctx)
	loginDTO.LoginDeviceID = "deviceID" // TODO: 获取设备ID

	var loginToken string
	if loginToken, err = services.Login(loginDTO); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	var resp vo.LoginResp
	resp.AccessToken = loginToken
	authController.OK(resp)
}

// Register
// @Description 注册
// @Router /auth/register [post]
func Register(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var req vo.RegisterReq
	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("Register failed, with error is %v", err)
		authController.Error("系统错误")
		return
	}

	registerDTO := converter.ToDTO[dto.RegisterDTO](&req)
	if err = services.Register(registerDTO); err != nil {
		authController.Logger.Errorf("Register failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	authController.OK(RegisterSuccess)
}

// GetCaptcha
// @Description 获取验证码
// @Router /auth/captcha [get]
func GetCaptcha(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	captchaDTO, err := services.GetCaptcha()
	if err != nil {
		authController.Logger.Errorf("GetCaptcha failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	resp := converter.ToVO[vo.CaptchaResp](captchaDTO)
	authController.OK(resp)
}

// GetLoginUser
// @Description 获取登录用户信息
// @Router /auth/login-user [get]
func GetLoginUser(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	userID := common.GetLoginUserID()
	userLoginInfoDTO, err := services.GetLoginUser(userID)
	if err != nil {
		authController.Logger.Errorf("GetLoginUser failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	var resp vo.LoginUserResp
	converter.Copy(&resp, userLoginInfoDTO)
	authController.OK(resp)
}

// Logout
// @Description 登出
// @Router /auth/logout [post]
func Logout(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	userID := common.GetLoginUserID()
	if err := services.Logout(userID); err != nil {
		authController.Logger.Errorf("Logout failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	authController.OK(LogoutSuccess)
}

// UpdateAuthUser
// @Description 更新个人信息
// @Router /auth/user-info [put]
func UpdateAuthUserInfo(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var req vo.UpdateAuthUserReq
	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("UpdateAuthUser failed, with error is %v", err)
		authController.Error("系统错误")
		return
	}

	authUserUpdateDTO := converter.ToDTO[dto.AuthUserUpdateDTO](&req)
	if err = services.UpdateAuthUser(authUserUpdateDTO); err != nil {
		authController.Logger.Errorf("UpdateAuthUser failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	authController.OK(UpdateUserInfoSuccess)
}

// ModifyAuthUserPassword
// @Description 修改密码
// @Router /auth/modify-password [put]
func ModifyAuthUserPassword(ctx *gin.Context) {
	authController := NewAuthController(ctx)

	var req vo.ModifyAuthUserPasswordReq
	err := authController.Bind(&req, binding.JSON).Errors
	if err != nil {
		authController.Logger.Errorf("ModifyAuthUserPassword failed, with error is %v", err)
		authController.Error("系统错误")
		return
	}

	if err = services.ModifyAuthUserPassword(req.OldPassword, req.NewPassword); err != nil {
		authController.Logger.Errorf("ModifyAuthUserPassword failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	authController.OK(ModifyUserPasswordSuccess)
}
