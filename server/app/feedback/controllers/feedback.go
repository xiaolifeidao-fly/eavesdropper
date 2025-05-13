package controllers

import (
	"errors"
	"fmt"
	"server/app/feedback/vo"
	"server/common"
	"server/common/base/page"
	"server/common/middleware/config"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/feedback/services"
	"server/internal/feedback/services/dto"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func LoadFeedbackRouter(router *gin.RouterGroup) {
	r := router.Group("/feedback")
	{
		r.Use(middleware.Authorization()).POST("", AddFeedback)
		r.Use(middleware.Authorization()).GET("/page", PageFeedback)
		r.Use(middleware.Authorization()).GET("/:id/info", GetFeedbackInfo)
		r.Use(middleware.Authorization()).PUT("/:id/mark/process", MarkFeedbackProcessing)
		r.Use(middleware.Authorization()).PUT("/:id/resolved", ResolvedFeedback)
	}
}

// AddFeedback
// @Description 添加反馈
// @Router /feedback [post]
func AddFeedback(ctx *gin.Context) {
	var err error

	var addReq dto.AddFeedbackDTO
	if err = controller.Bind(ctx, &addReq, binding.JSON); err != nil {
		logger.Infof("AddFeedback Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	addReq.Status = dto.Pending.String()
	addReq.UserID = common.GetLoginUserID()

	var feedbackDTO *dto.FeedbackDTO
	if feedbackDTO, err = services.AddFeedback(&addReq); err != nil {
		logger.Infof("AddFeedback Bind error: %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, feedbackDTO.ID)
}

// PageFeedback
// @Description 分页获取反馈
// @Router /feedback/page [get]
func PageFeedback(ctx *gin.Context) {
	var err error

	var pageReq dto.FeedbackPageParamDTO
	if err = controller.Bind(ctx, &pageReq, binding.Form); err != nil {
		logger.Infof("PageFeedback Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	userID := common.GetLoginUserID()
	if !isAdmin(userID) {
		// 非管理员用户只能看到自己提交的反馈数据
		pageReq.UserID = userID
	}

	var pageDTO *page.Page[dto.FeedbackPageDTO]
	if pageDTO, err = services.PageFeedback(&pageReq); err != nil {
		logger.Errorf("PageFeedback failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, pageDTO)
}

// 判断是否为admin
func isAdmin(userID uint64) bool {
	if userID == 0 {
		return false
	}

	adminIdS := config.GetString("admin_ids")
	if adminIdS == "" {
		return false
	}

	userIDStr := fmt.Sprintf("%d", userID)
	adminIdList := strings.Split(adminIdS, ",")
	return slices.Contains(adminIdList, userIDStr)
}

// GetFeedbackInfo
// @Description 获取反馈详情信息
// @Router /feedback/page/:id/info [get]
func GetFeedbackInfo(ctx *gin.Context) {
	var err error

	var req *vo.GetFeedbackInfoReqVo
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Infof("GetFeedbackInfo Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	var feedbackInfoDTO *dto.FeedbackInfoDTO
	if feedbackInfoDTO, err = services.GetFeedbackInfo(req.ID); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	feedbackID := feedbackInfoDTO.ID
	userID := common.GetLoginUserID()
	if isAdmin(userID) {
		var processes []*dto.ProcessDTO
		if processes, err = services.GetProcessesByFeedbackID(feedbackID); err != nil {
			controller.Error(ctx, err.Error())
			return
		}
		feedbackInfoDTO.Processes = processes
	}

	controller.OK(ctx, feedbackInfoDTO)
}

// MarkFeedbackProcessing
// @Description 更新反馈状态为处理中
// @Router /feedback/:id/mark/process [put]
func MarkFeedbackProcessing(ctx *gin.Context) {
	var err error

	var req *vo.MarkFeedbackProcessingReqVo
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Infof("MarkFeedbackProcessing Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	// 更新反馈状态
	var feedbackDTO *dto.FeedbackDTO
	if feedbackDTO, err = updateFeedbackStatus(req.ID, dto.Resolved.String()); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, feedbackDTO)
}

// ResolvedFeedback
// @Description 处理反馈
// @Router /feedback/:id/mark/resolved [put]
func ResolvedFeedback(ctx *gin.Context) {
	var err error

	var req *vo.ResolvedFeedbackReqVo
	if err = controller.Bind(ctx, &req, nil, binding.JSON); err != nil {
		logger.Infof("ResolvedFeedback Bind error: %v", err)
		controller.Error(ctx, "参数错误")
		return
	}

	// 保存提交结果数据
	processDTO := req.ToProcessDTO()
	if processDTO, err = services.SaveOrUpdateProcess(processDTO); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	// 更新反馈状态
	if _, err = updateFeedbackStatus(req.ID, dto.Resolved.String()); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, processDTO)
}

func updateFeedbackStatus(feedbackID uint64, status string) (*dto.FeedbackDTO, error) {
	var err error

	// 修改反馈状态
	var feedbackDTO *dto.FeedbackDTO
	if feedbackDTO, err = services.GetFeedbackByID(feedbackID); err != nil {
		return nil, err
	}
	if feedbackDTO == nil || feedbackDTO.ID == 0 {
		return nil, errors.New("反馈不存在")
	}

	feedbackDTO.Status = status
	if feedbackDTO, err = services.SaveOrUpdateFeedback(feedbackDTO); err != nil {
		return nil, err
	}

	return feedbackDTO, nil
}
