package routers

import (
	"github.com/gin-gonic/gin"
)

func init() {
	registerRouters = append(registerRouters, registerUserRouter)
}

func registerUserRouter(router *gin.RouterGroup) {
	// r := router.Group("/users")
	{
		// r.Use(middleware.JwtAuth()).POST("", controllers.Add)
		// r.Use(middleware.JwtAuth()).DELETE("/:id", controllers.Delete)
		// r.Use(middleware.JwtAuth()).PUT("/:id", controllers.Update)
		// r.Use(middleware.JwtAuth()).GET("/:id", controllers.Get)
		// r.GET("/page", controllers.Page)
		// r.Use(middleware.JwtAuth()).GET("/list", controllers.GetList)
	}
}
