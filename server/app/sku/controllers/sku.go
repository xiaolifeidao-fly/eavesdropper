package controllers

import (
	"server/app/sku/vo"
	"server/common"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuRouter(router *gin.RouterGroup) {
	r := router.Group("/sku")
	{
		r.POST("", AddSku)
	}
}

// AddSku
// @Description 保存商品
func AddSku(ctx *gin.Context) {
	var err error

	var req vo.SkuAddReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("SaveSku failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var skuID uint64
	skuDTO := converter.ToDTO[dto.SkuDTO](&req)
	skuDTO.CreatedBy = common.GetLoginUserID()
	skuDTO.UpdatedBy = common.GetLoginUserID()
	if skuID, err = services.CreateSku(skuDTO); err != nil {
		logger.Errorf("SaveSku failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, skuID)
}
