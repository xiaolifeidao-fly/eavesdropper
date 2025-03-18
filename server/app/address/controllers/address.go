package controllers

import (
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/address/services"
	"server/internal/address/services/dto"
	shopServices "server/internal/shop/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadAddressRouter(router *gin.RouterGroup) {
	r := router.Group("/address")
	{
		r.Use(middleware.Authorization()).GET("/template", GetAddressTemplateByKeywords)
		r.Use(middleware.Authorization()).GET("/:keywords", GetAddressByKeywords)
		r.Use(middleware.Authorization()).POST("/template/save", SaveAddressTemplate)
		r.Use(middleware.Authorization()).POST("/save", SaveAddress)
	}
}

func GetAddressTemplateByKeywords(ctx *gin.Context) {
	keywords := ctx.Query("keywords")
	resourceId, _ := strconv.ParseUint(ctx.Query("resourceId"), 10, 64)

	shopDTO, err := shopServices.GetShopByResourceID(resourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	if shopDTO == nil {
		controller.OK(ctx, nil)
		return
	}
	address, err := services.GetAddressByKeywordsAndUserNumId(keywords, strconv.FormatUint(shopDTO.ShopID, 10))
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
	shopDTO, err := shopServices.GetShopByResourceID(req.ResourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	if shopDTO == nil {
		controller.Error(ctx, "资源未同步商铺信息")
		return
	}
	req.UserId = strconv.FormatUint(shopDTO.ShopID, 10)
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
