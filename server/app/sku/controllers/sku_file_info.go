package controllers

import (
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadSkuFileInfoRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/file")
	{
		r.Use(middleware.Authorization()).POST("/save", SaveSkuFile)
		r.Use(middleware.Authorization()).GET("/get", GetSkuFile)
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
	resourceId, _ := strconv.ParseUint(ctx.Query("resourceId"), 10, 64)
	result, err := services.GetSkuFileDetail(skuItemId, resourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
