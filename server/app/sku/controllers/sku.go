package controllers

import (
	"server/app/sku/vo"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuRouter(router *gin.RouterGroup) {
	r := router.Group("/sku")
	{
		r.Use(middleware.Authorization()).POST("", AddSku)
		r.Use(middleware.Authorization()).GET("/check-existence", CheckSkuExistence)
		r.Use(middleware.Authorization()).GET("/page", PageSku)
	}
}

// AddSku
// @Description 保存商品
func AddSku(ctx *gin.Context) {
	var err error

	var req vo.SkuAddReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("SaveSku failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	skuDTO := converter.ToDTO[dto.SkuDTO](&req)
	userID := common.GetLoginUserID()
	skuDTO.UserID = userID
	skuDTO.CreatedBy = userID
	skuDTO.UpdatedBy = userID
	var skuID uint64
	if skuID, err = services.CreateSku(skuDTO); err != nil {
		logger.Errorf("SaveSku failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, skuID)
}

// CheckSkuExistence
// @Description 检查商品是否存在
func CheckSkuExistence(ctx *gin.Context) {
	var err error

	var req vo.CheckSkuExistenceReq
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("CheckSkuExistence failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var skuDTO *dto.SkuDTO
	if skuDTO, err = services.GetSkuByPublishResourceIdAndSourceSkuId(req.PublishResourceID, req.SourceSkuID); err != nil {
		if skuDTO.Status == services.SKU_SUCCESS {
			logger.Errorf("CheckSkuExistence failed, with error is %v", err)
			controller.Error(ctx, err.Error())
			return
		}
	}

	var resp bool
	if skuDTO != nil {
		resp = true
	}
	controller.OK(ctx, resp)
}

// PageSku
// @Description 获取商品分页
func PageSku(ctx *gin.Context) {
	var err error

	var req vo.SkuPageReq
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("GetSkuPage failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	userID := common.GetLoginUserID()

	param := converter.ToDTO[dto.SkuPageParamDTO](&req)
	var pageDTO *page.Page[dto.SkuPageDTO]
	if pageDTO, err = services.PageSku(param, userID); err != nil {
		logger.Errorf("Page failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	pageData := make([]*vo.SkuPageResp, 0)
	for _, pageDTO := range pageDTO.Data {
		pageResp := &vo.SkuPageResp{}
		converter.Copy(pageResp, pageDTO)
		if pageDTO.PublishSkuId != "" {
			pageResp.PublishUrl = "https://item.taobao.com/item.htm?id=" + pageDTO.PublishSkuId // TODO
		}
		pageData = append(pageData, pageResp)
	}

	// converter.Copy(&pageData, pageDTO.Data)

	// pageDataMock := make([]*vo.SkuPageResp, 0)
	// for _, v := range pageData {
	// 	pageDataMock = append(pageDataMock, &v)
	// }

	pageResp := page.BuildPage[vo.SkuPageResp](pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)

}
