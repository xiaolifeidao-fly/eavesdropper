package controllers

import (
	"server/common/server/controller"
	"server/internal/address/services"
	"server/internal/address/services/dto"
	taobaoServices "server/internal/resource/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadAddressRouter(router *gin.RouterGroup) {
	r := router.Group("/address")
	{
		r.Use().GET("/template", GetAddressTemplateByKeywords)
		r.Use().GET("/:keywords", GetAddressByKeywords)
		r.Use().POST("/template/save", SaveAddressTemplate)
		r.Use().POST("/save", SaveAddress)
	}
}

func GetAddressTemplateByKeywords(ctx *gin.Context) {
	keywords := ctx.Query("keywords")
	resourceId, _ := strconv.ParseUint(ctx.Query("resourceId"), 10, 64)

	resourceTaobao, err := taobaoServices.GetResourceTaobaoByResourceID(resourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	if resourceTaobao == nil {
		controller.OK(ctx, nil)
		return
	}
	address, err := services.GetAddressByKeywordsAndUserNumId(keywords, strconv.FormatUint(resourceTaobao.UserNumId, 10))
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, address)
}

func GetAddressByKeywords(ctx *gin.Context) {
	keywords := ctx.Param("keywords")
	if keywords == "" {
		keywords = "北京市"
	}
	address, err := services.GetAddressByKeywords(keywords)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, address)
}

func SaveAddressTemplate(ctx *gin.Context) {
	var req dto.AddressTemplateDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	resourceTaobao, err := taobaoServices.GetResourceTaobaoByResourceID(req.ResourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	if resourceTaobao == nil {
		controller.Error(ctx, "资源未绑定淘宝账号")
		return
	}
	req.UserNumId = strconv.FormatUint(resourceTaobao.UserNumId, 10)
	addressTemplate, err := services.SaveAddressTemplate(&req)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, addressTemplate)
}

func SaveAddress(ctx *gin.Context) {
	var req dto.AddressDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	address, err := services.SaveAddress(&req)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, address)
}
