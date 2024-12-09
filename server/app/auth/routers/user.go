package routers

import (
	"server/app/auth/controllers"
	"server/common/server/middleware"

	"github.com/gin-gonic/gin"
)

func init() {
	registerRouters = append(registerRouters, registerUserRouter)
}

func registerUserRouter(router *gin.RouterGroup) {
	r := router.Group("/users")
	{
		// r.Use(middleware.JwtAuth()).POST("", controllers.Add)
		// r.Use(middleware.JwtAuth()).DELETE("/:id", controllers.Delete)
		// r.Use(middleware.JwtAuth()).PUT("/:id", controllers.Update)
		// r.Use(middleware.JwtAuth()).GET("/:id", controllers.Get)
		r.Use(middleware.JwtAuth()).GET("/page", controllers.Page)
		// r.Use(middleware.JwtAuth()).GET("/list", controllers.GetList)
	}
}
