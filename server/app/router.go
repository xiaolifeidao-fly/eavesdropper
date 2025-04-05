package app

import (
	addressControllers "server/app/address/controllers"
	authControllers "server/app/auth/controllers"
	categoryControllers "server/app/category/controllers"
	doorControllers "server/app/door/controllers"
	resourceControllers "server/app/resource/controllers"
	shopControllers "server/app/shop/controllers"
	skuControllers "server/app/sku/controllers"
	versionControllers "server/app/version/controllers"

	"github.com/gin-gonic/gin"
)

func GetAppRouters() []func(g *gin.RouterGroup) {
	AppRouters := make([]func(g *gin.RouterGroup), 0)
	AppRouters = append(AppRouters, authControllers.LoadAuthRouter)         // 添加认证路由
	AppRouters = append(AppRouters, authControllers.LoadUserRouter)         // 添加用户路由
	AppRouters = append(AppRouters, doorControllers.LoadDoorRouter)         // 添加用户路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuRouter)           // 添加sku路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuFileInfoRouter)   // 添加sku-file-info路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuTaskRouter)       // 添加sku-task路由
	AppRouters = append(AppRouters, resourceControllers.LoadResourceRouter) // 添加resource路由
	AppRouters = append(AppRouters, shopControllers.LoadShopRouter)         // 添加shop路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuDraftInfoRouter)  // 添加sku-draft-info路由
	AppRouters = append(AppRouters, addressControllers.LoadAddressRouter)   // 添加address路由
	AppRouters = append(AppRouters, categoryControllers.LoadCategoryRouter) // 添加address路由
	AppRouters = append(AppRouters, skuControllers.LoadSkuTaskItemRouter)   // 添加sku-task-item路由
	AppRouters = append(AppRouters, versionControllers.LoadVersionRouter)   // 添加version路由
	return AppRouters
}
