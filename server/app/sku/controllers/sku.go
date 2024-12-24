package controllers

import (
	"server/app/sku/vo"
	"server/common/logger"
	"server/common/server/controller"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuRouter(router *gin.RouterGroup) {
	r := router.Group("/sku")
	{
		r.POST("", SaveSku)
	}
}

func SaveSku(ctx *gin.Context) {
	var err error

	var req vo.SkuAddReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("SaveSku failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, nil)
}
