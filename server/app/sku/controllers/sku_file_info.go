package controllers

import (
	"server/common/server/controller"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"

	"github.com/gin-gonic/gin"
)

func LoadSkuFileInfoRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/file")
	{
		r.POST("/save", SaveSkuFile)
		r.GET("/get", GetSkuFile)
	}
}

func SaveSkuFile(ctx *gin.Context) {
	var skuFileInfoDTO dto.SkuFileInfoDTO
	controller.Bind(ctx, &skuFileInfoDTO)
	result, err := services.SaveSkuFileInfo(&skuFileInfoDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func GetSkuFile(ctx *gin.Context) {
	skuItemId := ctx.Query("skuItemId")
	result, err := services.GetSkuFileDetail(skuItemId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
