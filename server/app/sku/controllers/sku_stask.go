package controllers

import (
	"encoding/json"
	"server/app/sku/vo"
	"server/common"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadSkuTaskRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/task")
	{
		r.Use(middleware.Authorization()).POST("", AddSkuTask)
		r.Use(middleware.Authorization()).PUT("/:id", UpdateSkuTask)
		r.Use(middleware.Authorization()).GET("/steps/:resourceId/:groupCode/:stepKey", GetSkuTaskSteps)
		r.Use(middleware.Authorization()).POST("/steps/:resourceId/:groupCode/:stepKey/init", InitSkuStep)
		r.Use(middleware.Authorization()).POST("/steps/save", SaveSkuTaskStep)
	}
}

func InitSkuStep(ctx *gin.Context) {
	stepKey := ctx.Param("stepKey")
	resourceId, err := strconv.ParseUint(ctx.Param("resourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, "resourceId 参数错误")
		return
	}
	groupCode := ctx.Param("groupCode")
	services.DeleteSkuTaskStepByKeyAndResourceIdAndGroupCode(stepKey, resourceId, groupCode)
	controller.OK(ctx, "初始化成功")
}

func GetSkuTaskSteps(ctx *gin.Context) {
	stepKey := ctx.Param("stepKey")
	resourceId, err := strconv.ParseUint(ctx.Param("resourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, "resourceId 参数错误")
		return
	}
	groupCode := ctx.Param("groupCode")
	steps, err := services.FindSkuTaskStepByKeyAndResourceIdAndGroupCode(stepKey, resourceId, groupCode)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, steps)
}

func SaveSkuTaskStep(ctx *gin.Context) {
	var step dto.SkuTaskStepDTO
	if err := controller.Bind(ctx, &step, binding.JSON); err != nil {
		controller.Error(ctx, "参数错误")
		return
	}
	result, err := services.SaveSkuTaskStep(&step)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// AddSkuTask
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
	if req.PriceRange != nil {
		priceRangeByte, _ := json.Marshal(req.PriceRange)
		taskDTO.PriceRate = string(priceRangeByte)
	}
	taskDTO.Status = string(dto.SkuTaskStatusPending)
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
