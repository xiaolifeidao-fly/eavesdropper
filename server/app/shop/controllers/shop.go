package controllers

import (
	"server/app/shop/vo"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	resourceServices "server/internal/resource/services"
	resourceDTO "server/internal/resource/services/dto"
	"server/internal/shop/services"
	"server/internal/shop/services/dto"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadShopRouter(router *gin.RouterGroup) {
	r := router.Group("/shop")
	{
		r.Use(middleware.Authorization()).DELETE("/:id", DeleteShop)
		r.Use(middleware.Authorization()).GET("/page", PageShop)
		r.Use(middleware.Authorization()).POST("/:id/sync", SyncShop)
		r.Use(middleware.Authorization()).GET("/list", GetShopInfos)
		r.Use(middleware.Authorization()).POST("/:id/bindAuthCode", BindShopAuthCode)
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
		var shopStatusEnum *dto.ShopStatusEnum
		if d.ExpirationDate == nil {
			shopStatusEnum = &dto.LoseEfficacy
		} else if d.ExpirationDate.BeforeTime(time.Now()) {
			shopStatusEnum = &dto.LoseEfficacy
		} else {
			shopStatusEnum = &dto.Effective
		}
		converter.Copy(&resp.Status, shopStatusEnum)
		pageData = append(pageData, resp)
	}

	pageResp := page.BuildPage(pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)
}

func GetShopInfos(ctx *gin.Context) {
	userID := common.GetLoginUserID()
	shopInfos, err := services.GetShopInfos(userID)
	if err != nil {
		logger.Errorf("GetShopInfos failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	shopInfosResp := make([]*vo.ShopInfoResp, 0)
	for _, shopInfo := range shopInfos {
		shopInfoResp := &vo.ShopInfoResp{}
		converter.Copy(shopInfoResp, shopInfo)
		resource, err := resourceServices.GetResourceByID(shopInfo.ResourceID)
		shopInfoResp.ExpirationDate = resource.ExpirationDate
		if err != nil {
			logger.Errorf("GetShopInfos failed, with error is %v", err)
			controller.Error(ctx, err.Error())
			return
		}
		if resource.ExpirationDate == nil {
			shopInfoResp.Status = dto.LoseEfficacy.Value
		} else if resource.ExpirationDate.BeforeTime(time.Now()) {
			shopInfoResp.Status = dto.LoseEfficacy.Value
		} else {
			shopInfoResp.Status = dto.Effective.Value
		}
		shopInfosResp = append(shopInfosResp, shopInfoResp)
	}
	controller.OK(ctx, shopInfosResp)
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

	// 判断店铺的资源是否有效
	var resourceDTO *resourceDTO.ResourceDTO
	if resourceDTO, err = resourceServices.GetResourceByID(req.ResourceID); err != nil {
		logger.Errorf("SyncShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	if resourceDTO.ExpirationDate == nil || resourceDTO.ExpirationDate.BeforeTime(time.Now()) {
		req.Status = dto.LoseEfficacy.Value
	} else {
		req.Status = dto.Effective.Value
	}

	syncDTO := converter.ToDTO[dto.ShopSyncDTO](&req)
	if err = services.SyncShop(syncDTO); err != nil {
		logger.Errorf("SyncShop failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, "同步成功")
}

// BindShopAuthCode
// @Description 绑定激活码
// @Router /shop/:id/bindAuthCode [post]
func BindShopAuthCode(ctx *gin.Context) {
	var err error

	var req vo.ShopBindAuthCodeReq
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	if err = services.BindShopAuthCode(req.ID, req.Token); err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, "绑定成功")
}
