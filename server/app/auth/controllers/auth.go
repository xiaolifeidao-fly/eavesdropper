package controllers

import (
	"server/app/auth/common/constants"
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
		authController.Error(err.Error())
		return
	}

	loginUserID := uint64(0)
	if err = services.Login(&req, &loginUserID); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	if err = generateTokenAndSetCookie(ctx, loginUserID); err != nil {
		authController.Logger.Errorf("Login failed, with error is %v", err)
		authController.Error(err.Error())
		return
	}

	authController.OK(constants.LoginSuccess)
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

// generateTokenAndSetCookie 生成token并设置cookie
func generateTokenAndSetCookie(c *gin.Context, loginUserID uint64) error {
	var err error

	// 生成token
	var token string
	if token, err = jwtauth.GenerateJwtToken(loginUserID); err != nil {
		return err
	}

	// 设置cookie
	maxAge := int(jwtauth.GetJwtAuthTimeout().Seconds())
	c.SetCookie(serverCommon.AuthHeader, token, maxAge, "/", "", false, true)

	return nil
}
