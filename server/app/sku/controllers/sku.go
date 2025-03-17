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
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuRouter(router *gin.RouterGroup) {
	r := router.Group("/sku")
	{
		r.Use(middleware.Authorization()).POST("", AddSku)
		r.Use(middleware.Authorization()).GET("/check-existence", CheckSkuExistence)
		r.Use(middleware.Authorization()).GET("/page", PageSku)
		r.Use(middleware.Authorization()).POST("/mappers", CreateSkuMappers)
		r.Use(middleware.Authorization()).GET("/get/:publishResourceId/:publishSkuId", GetSkuByPublishResourceIdAndPublishSkuId)
	}
}

func GetSkuByPublishResourceIdAndPublishSkuId(ctx *gin.Context) {
	publishResourceId, err := strconv.ParseUint(ctx.Param("publishResourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	publishSkuId := ctx.Param("publishSkuId")
	sku, err := services.GetSkuByPublishResourceIdAndPublishSkuId(publishResourceId, publishSkuId, services.SKU_SUCCESS)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, sku)
}

// CreateSkuMapper
// @Description 保存商品映射
func CreateSkuMappers(ctx *gin.Context) {
	var err error

	var req []*dto.SkuMapperDto
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("SaveSkuMapper failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	for _, skuMapper := range req {
		if _, err = services.CreateSkuMapper(skuMapper); err != nil {
			logger.Errorf("SaveSkuMapper failed, with error is %v", err)
			continue
		}
	}
	controller.OK(ctx, "success")
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
	if skuDTO, err = services.GetSkuByPublishResourceIdAndSourceSkuIdAndSource(req.PublishResourceID, req.SourceSkuID, req.Source); err != nil {
		if skuDTO != nil && skuDTO.Status == services.SKU_SUCCESS {
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
		pageResp.PublishUrl = services.GetSkuSourceUrl(pageDTO.Source, pageDTO.PublishSkuId)
		pageData = append(pageData, pageResp)
	}

	pageResp := page.BuildPage[vo.SkuPageResp](pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)

}
