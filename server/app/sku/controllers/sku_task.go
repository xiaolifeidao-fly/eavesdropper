package controllers

import (
	"encoding/json"
	"server/app/sku/vo"
	"server/common"
	"server/common/base/page"
	baseVO "server/common/base/vo"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	resourceDTO "server/internal/resource/services/dto"
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
		r.Use(middleware.Authorization()).GET("/:id", GetSkuTask)
		r.Use(middleware.Authorization()).GET("/steps/:resourceId/:groupCode/:taskId/:stepKey", GetSkuTaskSteps)
		r.Use(middleware.Authorization()).POST("/steps/:resourceId/:groupCode/:taskId/:stepKey/init", InitSkuStep)
		r.Use(middleware.Authorization()).POST("/steps/save", SaveSkuTaskStep)
		r.Use(middleware.Authorization()).GET("/page", PageSkuTask)
		r.Use(middleware.Authorization()).GET("/status/enums", GetSkuTaskStatusLabelValue)
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
	taskId, err := strconv.ParseUint(ctx.Param("taskId"), 10, 64)
	if err != nil {
		controller.Error(ctx, "taskId 参数错误")
		return
	}
	services.DeleteSkuTaskStepByKeyAndResourceIdAndGroupCode(taskId, stepKey, resourceId, groupCode)
	controller.OK(ctx, "初始化成功")
}

func GetSkuTaskSteps(ctx *gin.Context) {
	stepKey := ctx.Param("stepKey")
	taskId, err := strconv.ParseUint(ctx.Param("taskId"), 10, 64)
	if err != nil {
		controller.Error(ctx, "taskId 参数错误")
		return
	}
	resourceId, err := strconv.ParseUint(ctx.Param("resourceId"), 10, 64)
	if err != nil {
		controller.Error(ctx, "resourceId 参数错误")
		return
	}
	groupCode := ctx.Param("groupCode")
	steps, err := services.FindSkuTaskStepByKeyAndResourceIdAndGroupCode(taskId, stepKey, resourceId, groupCode)
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
// @Description 添加任务
func AddSkuTask(ctx *gin.Context) {
	var err error

	var req vo.AddSkuTaskReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Infof("AddSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	taskDTO := converter.ToDTO[dto.AddSkuTaskDTO](&req)
	if req.PriceRange != nil {
		priceRangeByte, _ := json.Marshal(req.PriceRange)
		taskDTO.PriceRate = string(priceRangeByte)
	}
	taskDTO.Status = dto.SkuTaskStatusPending.Value
	taskDTO.UserID = common.GetLoginUserID()
	taskDTO.CreatedBy = common.GetLoginUserID()
	taskDTO.UpdatedBy = common.GetLoginUserID()
	var skuTaskDTO *dto.SkuTaskDTO
	if skuTaskDTO, err = services.CreateSkuTask(taskDTO); err != nil {
		logger.Errorf("AddSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, skuTaskDTO)
}

// UpdateSkuTask
// @Description 更新任务
func UpdateSkuTask(ctx *gin.Context) {
	var err error
	var req vo.UpdateSkuTaskReq
	if err := controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Infof("UpdateSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	var skuTaskDTO *dto.SkuTaskDTO
	updateTaskDTO := converter.ToDTO[dto.UpdateSkuTaskDTO](&req)
	if skuTaskDTO, err = services.UpdateSkuTask(updateTaskDTO); err != nil {
		logger.Errorf("UpdateSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, skuTaskDTO)
}

// GetSkuTask
// @Description 获取任务
func GetSkuTask(ctx *gin.Context) {
	var err error
	var req vo.GetSkuTaskReq
	if err := controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Infof("GetSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	skuTaskDTO, err := services.GetSkuTask(req.ID)
	if err != nil {
		logger.Errorf("GetSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	skuTaskItemList, err := services.GetSkuTaskItemListByTaskID(req.ID)
	if err != nil {
		logger.Errorf("GetSkuTaskItemListByTaskID failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	skuTaskDTO.Items = skuTaskItemList

	controller.OK(ctx, skuTaskDTO)
}

// PageSkuTask
// @Description 分页查询任务
func PageSkuTask(ctx *gin.Context) {
	var err error

	var req vo.SkuTaskPageReq
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("PageSkuTask Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	userID := common.GetLoginUserID()
	req.UserID = userID

	param := converter.ToDTO[dto.SkuTaskPageParamDTO](&req)
	var pageDTO *page.Page[dto.SkuTaskPageDTO]
	if pageDTO, err = services.PageSkuTask(param); err != nil {
		logger.Errorf("PageSkuTask failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	pageData := make([]*vo.SkuTaskPageResp, 0)
	for _, pageDTO := range pageDTO.Data {
		resp := &vo.SkuTaskPageResp{}
		converter.Copy(resp, pageDTO)
		var statusLableValue baseVO.LabelValueVO
		if skuTaskStatusEnum := dto.GetSkuTaskStatusEnum(pageDTO.Status); skuTaskStatusEnum != nil {
			converter.Copy(&statusLableValue, skuTaskStatusEnum)
			resp.StatusLableValue = statusLableValue
		}
		var sourceLableValue baseVO.LabelValueVO
		if sourceLableValueEnum := resourceDTO.GetResourceSourceEnumByValue(pageDTO.Source); sourceLableValueEnum != nil {
			converter.Copy(&sourceLableValue, sourceLableValueEnum)
			resp.SourceLableValue = sourceLableValue
		}
		pageData = append(pageData, resp)
	}

	controller.OK(ctx, page.BuildPage(pageDTO.PageInfo, pageData))
}

// GetSkuTaskStatusLabelValue
// @Description 获取任务状态枚举
// @Router /sku/task/status/enums [get]
func GetSkuTaskStatusLabelValue(ctx *gin.Context) {
	controller.OK(ctx, dto.GetSkuTaskStatusEnums())
}
