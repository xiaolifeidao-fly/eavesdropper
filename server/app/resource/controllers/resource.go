package controllers

import (
	"server/app/resource/vo"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/resource/services"
	"server/internal/resource/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	DeleteResourceSuccess = "删除成功"
	UpdateResourceSuccess = "修改成功"
)

func LoadResourceRouter(router *gin.RouterGroup) {
	r := router.Group("/resource")
	{
		r.Use(middleware.Authorization()).POST("", AddResource)
		r.Use(middleware.Authorization()).DELETE("/:id", DeleteResource)
		r.Use(middleware.Authorization()).PUT("/:id", UpdateResource)
		r.Use(middleware.Authorization()).GET("/:id", GetResource)
		r.Use(middleware.Authorization()).GET("/page", PageResource)
		r.Use(middleware.Authorization()).GET("/source", GetResourceSourceList)
		r.Use(middleware.Authorization()).GET("/tag", GetResourceTagList)
	}
}

// AddResource
// @Description 添加资源
// @Router /resource [post]
func AddResource(ctx *gin.Context) {
	var err error

	var req vo.AddResourceReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("AddResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	req.UserID = common.GetLoginUserID()

	var id uint64
	reqDTO := converter.ToDTO[dto.AddResourceDTO](&req)
	if id, err = services.CreateResource(reqDTO); err != nil {
		logger.Errorf("AddResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, id)
}

// DeleteResource
// @Description 删除资源
// @Router /resource/:id [delete]
func DeleteResource(ctx *gin.Context) {
	var err error

	var req vo.DeleteResourceReq
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("DeleteResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	if err = services.DeleteResource(req.ID); err != nil {
		logger.Errorf("DeleteResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, DeleteResourceSuccess)
}

// UpdateResource
// @Description 修改资源
// @Router /resource/:id [put]
func UpdateResource(ctx *gin.Context) {
	var err error

	var req vo.UpdateResourceReq
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Errorf("UpdateResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var resourceDTO *dto.ResourceDTO
	if resourceDTO, err = services.GetResourceByID(req.ID); err != nil {
		logger.Errorf("UpdateResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	resourceDTO.Tag = req.Tag
	resourceDTO.Remark = req.Remark
	resourceDTO.InitUpdate()

	if _, err = services.UpdateResource(resourceDTO); err != nil {
		logger.Errorf("UpdateResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, UpdateResourceSuccess)
}

// GetResource
// @Description 获取资源
// @Router /resource/:id [get]
func GetResource(ctx *gin.Context) {
	var err error

	var req vo.GetResourceReq
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("GetResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var resourceDTO *dto.ResourceDTO
	if resourceDTO, err = services.GetResourceByID(req.ID); err != nil {
		logger.Errorf("GetResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	resourceVO := converter.ToVO[vo.ResourceResp](resourceDTO)
	controller.OK(ctx, resourceVO)
}

// PageResource
// @Description 资源分页
// @Router /resource/page [get]
func PageResource(ctx *gin.Context) {
	var err error

	var req vo.ResourcePageReq
	if err = controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("PageResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	req.UserID = common.GetLoginUserID()

	param := converter.ToDTO[dto.ResourcePageParamDTO](&req)
	var pageDTO *page.Page[dto.ResourcePageDTO]
	if pageDTO, err = services.PageResource(param); err != nil {
		logger.Errorf("PageResource failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	pageData := make([]*vo.ResourcePageResp, 0)
	for _, d := range pageDTO.Data {
		resp := &vo.ResourcePageResp{}
		converter.Copy(resp, d)
		sourceLabel := services.GetResourceSourceLabel(d.Source)
		resp.Source.Value = d.Source
		if sourceLabel != nil {
			resp.Source.Label = sourceLabel.Label
			resp.Source.Color = sourceLabel.Color
		}
		tagLabel := services.GetResourceTagLabel(d.Tag)
		resp.Tag.Value = d.Tag
		if tagLabel != nil {
			resp.Tag.Label = tagLabel.Label
			resp.Tag.Color = tagLabel.Color
		}
		pageData = append(pageData, resp)
	}

	pageResp := page.BuildPage(pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)
}

// GetResourceSourceList
// @Description 获取资源来源列表
// @Router /resource/source [get]
func GetResourceSourceList(ctx *gin.Context) {
	controller.OK(ctx, services.GetResourceSourceList())
}

// GetResourceTagList
// @Description 获取资源标签列表
// @Router /resource/tag [get]
func GetResourceTagList(ctx *gin.Context) {
	controller.OK(ctx, services.GetResourceTagList())
}
