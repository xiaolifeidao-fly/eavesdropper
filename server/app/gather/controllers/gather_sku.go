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

func LoadGatherSkuRouter(router *gin.RouterGroup) {
	r := router.Group("/gather-sku")
	{
		r.Use(middleware.Authorization()).POST("", AddGatherSku)
	}
}

// AddGatherSku
// @Description 添加采集商品
// @Router /gather-sku [post]
func AddGatherSku(ctx *gin.Context) {
	var err error

	var addDto dto.GatherSkuDTO
	if err = controller.Bind(ctx, &addDto, binding.JSON); err != nil {
		logger.Infof("AddGatherSku Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	addDto.CreatedBy = common.GetLoginUserID()
	addDto.UpdatedBy = common.GetLoginUserID()

	var gatherSku *dto.GatherSkuDTO
	if gatherSku, err = services.AddGatherSku(&addDto); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, gatherSku)
}
