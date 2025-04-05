package controllers

import (
	"server/app/version/vo"
	"server/common"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/version/services"
	"server/internal/version/services/dto"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadVersionRouter(router *gin.RouterGroup) {
	r := router.Group("/version")
	{
		// 公开接口，不需要认证
		r.GET("/latest", GetLatestVersion)
		r.GET("/app-latest", GetLatestAppVersion)

		// 需要认证的接口
		r.Use(middleware.Authorization()).POST("", AddVersion)
		r.Use(middleware.Authorization()).PUT("", UpdateVersion)
		r.Use(middleware.Authorization()).POST("/publish/:id", PublishVersion)
		r.Use(middleware.Authorization()).DELETE("/:id", DeleteVersion)
		r.Use(middleware.Authorization()).GET("/check-existence", CheckVersionExistence)
		r.Use(middleware.Authorization()).GET("/list", ListVersions)
		r.Use(middleware.Authorization()).GET("/:id", GetVersionById)
	}
}

// AddVersion
// @Description 添加版本
func AddVersion(ctx *gin.Context) {
	var err error

	var req vo.VersionAddReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("AddVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	versionDTO := converter.ToDTO[dto.VersionDto](&req)
	userID := common.GetLoginUserID()
	versionDTO.CreatedBy = userID
	versionDTO.UpdatedBy = userID

	result, err := services.CreateVersion(versionDTO)
	if err != nil {
		logger.Errorf("AddVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// UpdateVersion
// @Description 更新版本
func UpdateVersion(ctx *gin.Context) {
	var err error

	var req vo.VersionUpdateReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("UpdateVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	versionDTO := converter.ToDTO[dto.VersionDto](&req)
	userID := common.GetLoginUserID()
	versionDTO.UpdatedBy = userID

	result, err := services.UpdateVersion(versionDTO)
	if err != nil {
		logger.Errorf("UpdateVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// PublishVersion
// @Description 发布版本
func PublishVersion(ctx *gin.Context) {
	versionId, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		logger.Errorf("PublishVersion failed, with error is %v", err)
		controller.Error(ctx, "版本ID格式错误")
		return
	}

	result, err := services.PublishVersion(versionId)
	if err != nil {
		logger.Errorf("PublishVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// DeleteVersion
// @Description 删除版本
func DeleteVersion(ctx *gin.Context) {
	versionId, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		logger.Errorf("DeleteVersion failed, with error is %v", err)
		controller.Error(ctx, "版本ID格式错误")
		return
	}

	result, err := services.DeleteVersion(versionId)
	if err != nil {
		logger.Errorf("DeleteVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// GetVersionById
// @Description 根据ID获取版本
func GetVersionById(ctx *gin.Context) {
	versionId, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		logger.Errorf("GetVersionById failed, with error is %v", err)
		controller.Error(ctx, "版本ID格式错误")
		return
	}

	result, err := services.GetVersionByVersionId(versionId)
	if err != nil {
		logger.Errorf("GetVersionById failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// GetLatestVersion
// @Description 获取最新版本
func GetLatestVersion(ctx *gin.Context) {
	var req vo.CheckVersionExistenceReq
	if err := controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("GetLatestVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	result, err := services.GetLatestVersion(req.AppId)
	if err != nil {
		logger.Errorf("GetLatestVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// GetLatestAppVersion
// @Description 获取默认应用的最新版本（无需参数）
func GetLatestAppVersion(ctx *gin.Context) {
	const defaultAppId = "eavesdropper" // 你的默认应用ID

	result, err := services.GetLatestVersion(defaultAppId)
	if err != nil {
		logger.Errorf("GetLatestAppVersion failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}

// CheckVersionExistence
// @Description 检查版本是否存在
func CheckVersionExistence(ctx *gin.Context) {
	var req vo.CheckVersionExistenceReq
	if err := controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("CheckVersionExistence failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	existVersion, err := services.GetVersionByVersion(req.AppId, req.Version)
	if err != nil {
		logger.Errorf("CheckVersionExistence failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	result := existVersion != nil
	controller.OK(ctx, result)
}

// ListVersions
// @Description 获取版本列表
func ListVersions(ctx *gin.Context) {
	var req vo.VersionPageReq
	if err := controller.Bind(ctx, &req, binding.Form); err != nil {
		logger.Errorf("ListVersions failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	result, err := services.ListVersions(req.AppId)
	if err != nil {
		logger.Errorf("ListVersions failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}
	controller.OK(ctx, result)
}
