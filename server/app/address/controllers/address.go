package controllers

import (
	"server/common/server/controller"
	"server/internal/address/services"
	"server/internal/address/services/dto"

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
	resourceId, _ := ctx.Get("resourceId")
	address, err := services.GetAddressByKeywordsAndResourceId(keywords, resourceId.(uint64))
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, address)
}

func GetAddressByKeywords(ctx *gin.Context) {
	keywords := ctx.Param("keywords")
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
