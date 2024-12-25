package controllers

import (
	"server/app/sku/vo"
	"server/common"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuTaskRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/task")
	{
		r.Use(middleware.Authorization()).POST("", AddSkuTask)
		r.Use(middleware.Authorization()).PUT("/:id", UpdateSkuTask)
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

	var taskID uint64
	taskDTO := converter.ToDTO[dto.SkuTaskDTO](&req)
	taskDTO.Status = "pending"
	taskDTO.UserID = common.GetLoginUserID()
	taskDTO.CreatedBy = common.GetLoginUserID()
	taskDTO.UpdatedBy = common.GetLoginUserID()
	if taskID, err = services.CreateSkuTask(taskDTO); err != nil {
		logger.Errorf("AddSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, taskID)
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

	updateTaskDTO := converter.ToDTO[dto.UpdateSkuTaskDTO](&req)
	if err = services.UpdateSkuTask(updateTaskDTO); err != nil {
		logger.Errorf("UpdateSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	logger.Infof("UpdateSkuTask req: %+v", req)
	controller.OK(ctx, "更新成功")
}
