package controllers

import (
	"server/app/shop/vo"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/shop/services"
	"server/internal/shop/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadShopRouter(router *gin.RouterGroup) {
	r := router.Group("/shop")
	{
		r.Use(middleware.Authorization()).DELETE("/:id", DeleteShop)
		r.Use(middleware.Authorization()).GET("/page", PageShop)
		r.Use(middleware.Authorization()).POST("/:id/sync", SyncShop)
	}
}

// DeleteShop
// @Description 删除店铺
// @Router /shop/:id [delete]
func DeleteShop(ctx *gin.Context) {
	var req vo.ShopDeleteReq
	if err := controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("DeleteShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	if err := services.DeleteShop(req.ID); err != nil {
		logger.Errorf("DeleteShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, "删除成功")
}

// PageShop
// @Description 店铺分页
// @Router /shop/page [get]
func PageShop(ctx *gin.Context) {
	var err error

	var req vo.ShopPageReq
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("PageShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	req.UserID = common.GetLoginUserID()

	param := converter.ToDTO[dto.ShopPageParamDTO](&req)
	var pageDTO *page.Page[dto.ShopPageDTO]
	if pageDTO, err = services.PageShop(param); err != nil {
		logger.Errorf("PageShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	pageData := make([]*vo.ShopPageResp, 0)
	for _, d := range pageDTO.Data {
		resp := &vo.ShopPageResp{}
		converter.Copy(resp, d)
		pageData = append(pageData, resp)
	}

	pageResp := page.BuildPage(pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)
}

// SyncShop
// @Description 同步店铺
// @Router /shop/:id/sync [post]
func SyncShop(ctx *gin.Context) {
	var err error

	var req vo.ShopSyncReq
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Errorf("SyncShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	syncDTO := converter.ToDTO[dto.ShopSyncDTO](&req)
	if err = services.SyncShop(syncDTO); err != nil {
		logger.Errorf("SyncShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, "同步成功")
}
