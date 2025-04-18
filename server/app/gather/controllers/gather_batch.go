package controllers

import (
	"server/common"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/gather/services"
	"server/internal/gather/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadGatherBatchRouter(router *gin.RouterGroup) {
	r := router.Group("/gather-batch")
	{
		r.Use(middleware.Authorization()).POST("", AddGatherBatch)
	}
}

// AddGatherBatch
// @Description 添加采集批次
// @Router /gather [post]
func AddGatherBatch(ctx *gin.Context) {
	var err error

	var addDto dto.GatherBatchDTO
	if err = controller.Bind(ctx, &addDto, binding.JSON); err != nil {
		logger.Infof("AddGatherBatch Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	addDto.UserID = common.GetLoginUserID()
	addDto.CreatedBy = common.GetLoginUserID()
	addDto.UpdatedBy = common.GetLoginUserID()

	// 获取当前批次号
	if addDto.BatchNo, err = services.GetGatherBatchNo(addDto.UserID, addDto.Source); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	// 添加采集批次
	gatherBatchDTO, err := services.AddGatherBatch(&addDto)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, gatherBatchDTO)
}
