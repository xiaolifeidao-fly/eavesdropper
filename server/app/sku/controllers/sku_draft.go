package controllers

import (
	"server/common/server/controller"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadSkuDraftInfoRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/draft")
	{
		r.POST("/active", ActiveSkuDraft)
		r.GET("/get", GetSkuDraft)
		r.GET("/expire", ExpireSkuDraft)
	}
}

func ActiveSkuDraft(ctx *gin.Context) {
	var skuDraftDto dto.SkuDraftDto
	controller.Bind(ctx, &skuDraftDto)
	result, err := services.ActiveSkuDraft(&skuDraftDto)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func ExpireSkuDraft(ctx *gin.Context) {
	resourceId, _ := strconv.ParseInt(ctx.Query("resourceId"), 10, 64)
	skuItemId := ctx.Query("skuItemId")
	result, err := services.ExpireSkuDraft(resourceId, skuItemId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func GetSkuDraft(ctx *gin.Context) {
	resourceId, _ := strconv.ParseInt(ctx.Query("resourceId"), 10, 64)
	skuItemId := ctx.Query("skuItemId")
	result, err := services.GetSkuDraftBySkuItemId(resourceId, skuItemId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
