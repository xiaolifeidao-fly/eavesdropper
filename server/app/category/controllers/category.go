package controllers

import (
	"server/app/category/vo"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/internal/category/services"
	"server/internal/category/services/dto"
	"server/internal/category/services/handler"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadCategoryRouter(router *gin.RouterGroup) {
	r := router.Group("/category")
	{
		r.POST("/batch", BatchAddCategory)
		r.GET("/get/tb", GetTBCategories)
	}
}

// BatchAddCategory
// @Description 批量保存分类
func BatchAddCategory(ctx *gin.Context) {
	var err error

	req := make([]*vo.CategoryAddReq, 0)
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("BatchAddCategory failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	categoryDTOs := converter.ToDTOs[dto.CategoryDTO](req)
	if err = services.BatchCreateCategory(categoryDTOs); err != nil {
		logger.Errorf("BatchAddCategory failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, "保存成功")
}

// GetTBCategories
// @Description 获取淘宝的分类
func GetTBCategories(ctx *gin.Context) {
	var err error

	if err = handler.GetTBCategoryHandler(); err != nil {
		logger.Errorf("GetTBCategories failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, "操作成功")
}
