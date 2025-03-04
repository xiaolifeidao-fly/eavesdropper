package controllers

import (
	"server/common/server/controller"
	"server/internal/door/services"
	"server/internal/door/services/dto"
	"server/internal/door/services/handler"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoadDoorRouter(router *gin.RouterGroup) {
	r := router.Group("/doors")
	{
		r.POST("/save", SaveDoorRecord)
		r.GET("/get", GetDoorRecord)
		r.POST("/file/save", SaveDoorFileRecord)
		r.GET("/file/get", GetDoorFileRecord)
		r.GET("/file/getByKey", GetDoorFileRecordByKey)
		r.POST("/sku/parse/:source", ParseDoorSkuInfo)
		r.GET("/sku/search", SearchSkuRecord)
		r.POST("/sku/search/save", SaveSearchSkuRecord)
		r.POST("/sku/cat/prop/save", SaveDoorSkuCatProp)
		r.GET("/sku/cat/prop/get", GetDoorSkuCatProps)
		r.GET("/sku/cat/prop/ai", GetDoorSkuCatPropsByAi)
	}
}

func GetDoorSkuCatPropsByAi(ctx *gin.Context) {
	params := map[string]interface{}{}
	controller.Bind(ctx, &params)
	doorSkuCatProps, err := services.GetDoorSkuCatPropsByAi(&params)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, doorSkuCatProps)
}

func SaveDoorSkuCatProp(ctx *gin.Context) {
	var doorSkuCatPropDTO []*dto.DoorSkuCatPropDTO
	controller.Bind(ctx, &doorSkuCatPropDTO)
	err := services.CreateDoorSkuCatProp(doorSkuCatPropDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, "success")
}

func GetDoorSkuCatProps(ctx *gin.Context) {
	source := ctx.Query("source")
	itemKey := ctx.Query("itemKey")
	doorSkuCatProps, err := services.GetDoorSkuCatProps(source, itemKey)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, doorSkuCatProps)
}

func SearchSkuRecord(ctx *gin.Context) {
	searchType := ctx.Query("searchType")
	title := ctx.Query("title")
	result, err := services.FindSearchSkuRecordBySearchTypeAndTitle(searchType, title)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func SaveSearchSkuRecord(ctx *gin.Context) {
	var searchSkuRecordDTO dto.SearchSkuRecordDTO
	controller.Bind(ctx, &searchSkuRecordDTO)
	result, err := services.CreateSearchSkuRecord(&searchSkuRecordDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func ParseDoorSkuInfo(ctx *gin.Context) {
	doorSkuDTO := &map[string]interface{}{}
	err := ctx.BindJSON(doorSkuDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	var source string
	if source = ctx.Param("source"); source == "" {
		controller.Error(ctx, "source is empty")
		return
	}

	doorInfoMap := handler.ParseDoorInfo(source, doorSkuDTO)
	controller.OK(ctx, doorInfoMap)
}

func SaveDoorRecord(ctx *gin.Context) {
	var doorRecordDTO dto.DoorRecordDTO
	controller.Bind(ctx, &doorRecordDTO)
	result, err := services.CreateDoorRecord(&doorRecordDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func GetDoorRecord(ctx *gin.Context) {
	doorKey := ctx.Query("doorKey")
	itemKey := ctx.Query("itemKey")
	itemType := ctx.Query("type")
	result, err := services.FindByDoorKeyAndItemKeyAndType(doorKey, itemKey, itemType)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func SaveDoorFileRecord(ctx *gin.Context) {
	var doorFileRecordDTO dto.DoorFileRecordDTO
	controller.Bind(ctx, &doorFileRecordDTO)
	result, err := services.SaveDoorFileRecord(&doorFileRecordDTO)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func GetDoorFileRecordByKey(ctx *gin.Context) {
	source := ctx.Query("source")
	resourceId, err := strconv.ParseUint(ctx.Query("resourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	fileKey := ctx.Query("fileKey")
	result, err := services.FindDoorFileRecordBySourceAndResourceIdAndFileKey(source, resourceId, fileKey)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

func GetDoorFileRecord(ctx *gin.Context) {
	source := ctx.Query("source")
	fileId := ctx.Query("fileId")
	resourceId, err := strconv.ParseUint(ctx.Query("resourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	result, err := services.FindDoorFileRecordBySourceAndFileId(source, fileId, resourceId)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
