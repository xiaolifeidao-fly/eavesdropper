package app

import (
	authControllers "server/app/auth/controllers"
	doorControllers "server/app/door/controllers"
	skuControllers "server/app/sku/controllers"

	"github.com/gin-gonic/gin"
)

func GetAppRouters() []func(g *gin.RouterGroup) {
	AppRouters := make([]func(g *gin.RouterGroup), 0)
	AppRouters = append(AppRouters, authControllers.LoadAuthRouter)       // 添加认证路由
	AppRouters = append(AppRouters, authControllers.LoadUserRouter)       // 添加用户路由
	AppRouters = append(AppRouters, doorControllers.LoadDoorRouter)       // 添加用户路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuRouter)         // 添加sku路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuFileInfoRouter) // 添加sku-file-info路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuTaskRouter)     // 添加sku-task路由
	return AppRouters
}
