package controllers

import (
	"server/app/sku/vo"
	"server/common/middleware/logger"
	"server/common/server/controller"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuTaskRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/task")
	{
		r.POST("", AddSkuTask)
		r.PUT("/:id", UpdateSkuTask)
	}
}

// AddSkuTask
// @Description 添加任务
func AddSkuTask(ctx *gin.Context) {
	var err error

	var req vo.AddSkuTaskReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Infof("AddSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	logger.Infof("AddSkuTask req: %v", req)
	controller.OK(ctx, 1)
}

// UpdateSkuTask
// @Description 更新任务
func UpdateSkuTask(ctx *gin.Context) {
	var err error

	var req vo.UpdateSkuTaskReq
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Infof("UpdateSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	logger.Infof("UpdateSkuTask req: %+v", req)
	controller.OK(ctx, 1)
}
