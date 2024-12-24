package controllers

import (
	"server/common/server/controller"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadSkuFileRouter(router *gin.RouterGroup) {
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
	skuId, err := strconv.ParseUint(ctx.Query("skuId"), 10, 64)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	result, err := services.GetSkuFileInfo(skuId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
