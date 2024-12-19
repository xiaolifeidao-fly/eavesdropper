package controllers

import (
	"server/common/server/controller"
	"server/internal/door/services"
	"server/internal/door/services/dto"

	"github.com/gin-gonic/gin"
)

func LoadDoorRouter(router *gin.RouterGroup) {
	r := router.Group("/doors")
	{
		r.POST("/save", SaveDoorRecord)
		r.GET("/get", GetDoorRecord)
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
