package routers

import (
	"server/app/auth/controllers"
	"server/common/server/middleware"

	"github.com/gin-gonic/gin"
)

func init() {
	registerRouters = append(registerRouters, registerAuthRouter)
}

func registerAuthRouter(router *gin.RouterGroup) {
	r := router.Group("/auth")
	{
		r.POST("/login", controllers.Login)
		r.GET("/login-captcha", controllers.GetLoginCaptcha)
		r.Use(middleware.JwtAuth()).GET("/login-user", controllers.GetLoginUser)
		r.Use(middleware.JwtAuth()).POST("/logout", controllers.Logout)
	}
}
