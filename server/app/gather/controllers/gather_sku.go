package controllers

import (
	"server/app/gather/vo"
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
		r.Use(middleware.Authorization()).PUT("/:id/favorite", FavoriteGatherSku)
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
	if gatherSku, err = services.GetGatherSkuListByBatchIDAndSkuID(addDto.BatchID, addDto.SkuID); err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	if gatherSku != nil && gatherSku.ID > 0 {
		addDto.ID = gatherSku.ID
		addDto.Favorite = gatherSku.Favorite
		addDto.CreatedAt = gatherSku.CreatedAt
		if _, err = services.UpdateGatherSku(&addDto); err != nil {
			controller.Error(ctx, err.Error())
			return
		}
		controller.OK(ctx, addDto)
		return
	}

	if gatherSku, err = services.AddGatherSku(&addDto); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, gatherSku)
}

// FavoriteGatherSku
// @Description 收藏采集商品
// @Router /gather-sku/:id/favorite [put]
func FavoriteGatherSku(ctx *gin.Context) {
	var err error

	var req vo.FavoriteGatherSkuVO
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Infof("FavoriteGatherSku Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	var gatherSku *dto.GatherSkuDTO
	if gatherSku, err = services.GetGatherSkuByID(req.ID); err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	gatherSku.Favorite = req.IsFavorite
	gatherSku.UpdatedBy = common.GetLoginUserID()
	if gatherSku, err = services.UpdateGatherSku(gatherSku); err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, gatherSku)
}
