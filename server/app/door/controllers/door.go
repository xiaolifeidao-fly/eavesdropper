package controllers

import (
	"server/common/server/controller"
	"server/internal/door/services"
	"server/internal/door/services/dto"
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

	}
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
	fileKey := ctx.Query("fileKey")
	result, err := services.FindDoorFileRecordBySourceAndFileKey(source, fileKey)
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
