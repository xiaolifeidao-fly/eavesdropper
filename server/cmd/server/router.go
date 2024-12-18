package server

import (
	authControllers "server/app/auth/controllers"

	"github.com/gin-gonic/gin"
)

func GetAppRouters() []func(g *gin.RouterGroup) {
	AppRouters := make([]func(g *gin.RouterGroup), 0)
	AppRouters = append(AppRouters, authControllers.LoadAuthRouter) // 添加认证路由
	AppRouters = append(AppRouters, authControllers.LoadUserRouter) // 添加用户路由
	return AppRouters
}
