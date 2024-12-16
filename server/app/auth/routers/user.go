package routers

import (
	"github.com/gin-gonic/gin"

	"server/app/auth/controllers"
	"server/common/server/middleware"
)

func init() {
	registerRouters = append(registerRouters, registerUserRouter)
}

func registerUserRouter(router *gin.RouterGroup) {
	r := router.Group("/users")
	{
		r.Use(middleware.Authorization()).POST("", controllers.AddUser)
		r.Use(middleware.Authorization()).DELETE("/:id", controllers.DeleteUser)
		r.Use(middleware.Authorization()).PUT("/:id", controllers.UpdateUser)
		r.Use(middleware.Authorization()).GET("/:id", controllers.GetUser)
		r.Use(middleware.Authorization()).GET("/page", controllers.Page)
	}
}
