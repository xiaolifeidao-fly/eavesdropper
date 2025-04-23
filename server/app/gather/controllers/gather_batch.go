package controllers

import (
	"server/app/gather/vo"
	"server/common"
	"server/common/base/page"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/gather/services"
	"server/internal/gather/services/dto"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadGatherBatchRouter(router *gin.RouterGroup) {
	r := router.Group("/gather-batch")
	{
		r.Use(middleware.Authorization()).POST("", AddGatherBatch)
		r.Use(middleware.Authorization()).GET("/page", PageGatherBatch)
		r.Use(middleware.Authorization()).GET("/:id/sku-list", GetGatherBatchSkuList)
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

// PageGatherBatch
// @Description 分页查询采集批次
// @Router /gather-batch/page [get]
func PageGatherBatch(ctx *gin.Context) {
	var err error

	var req dto.GatherBatchPageParamDTO
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Infof("PageGatherBatch Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	userID := common.GetLoginUserID()
	req.UserID = userID

	var pageDTO *page.Page[dto.GatherBatchPageDTO]
	if pageDTO, err = services.PageGatherBatch(&req); err != nil {
		logger.Errorf("PageGatherBatch failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, pageDTO)
}

// GetGatherBatchSkuList
// @Description 获取采集批次商品列表
// @Router /gather-batch/{id}/sku-list [get]
func GetGatherBatchSkuList(ctx *gin.Context) {
	var err error

	var req vo.GatherBatchSkuListVO
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Infof("GetGatherBatchSkuList Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	var skuList []*dto.GatherSkuDTO
	if skuList, err = services.GetGatherSkuListByBatchID(req.ID); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	// 按更新时间排序
	sort.Slice(skuList, func(i, j int) bool {
		return skuList[i].UpdatedAt.After(skuList[j].UpdatedAt)
	})

	controller.OK(ctx, skuList)
}
