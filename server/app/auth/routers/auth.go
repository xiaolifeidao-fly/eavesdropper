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
		r.POST("/register", controllers.Register)
		r.GET("/captcha", controllers.GetCaptcha)
		r.Use(middleware.Authorization()).GET("/login-user", controllers.GetLoginUser)
		r.Use(middleware.Authorization()).POST("/logout", controllers.Logout)
	}
}
