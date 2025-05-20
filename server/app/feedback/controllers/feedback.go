package controllers

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
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
		r.Use(middleware.Authorization()).GET("/status/enums", GetFeedbackStatusEnums)
		r.Use(middleware.Authorization()).GET("/type/enums", GetFeedbackTypeEnums)
		r.Use(middleware.Authorization()).GET("/admin", UserIsAdmin)
	}
}

// AddFeedback
// @Description 添加反馈
// @Router /feedback [post]
func AddFeedback(ctx *gin.Context) {
	ctx.Request.ParseMultipartForm(10 << 20)

	var err error
	form, err := ctx.MultipartForm()
	if err != nil {
		logger.Errorf("AddFeedback failed, with error is %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	files := form.File["files"]
	attachments, err := getAttachments(files)
	if err != nil {
		logger.Errorf("AddFeedback failed, with error is %v", err)
		controller.Error(ctx, "参数错误")
		return
	}
	logger.Infof("attachments: %v", attachments)

	title := ctx.PostForm("title")
	feedbackType := ctx.PostForm("feedbackType")
	content := ctx.PostForm("content")
	contactInfo := ctx.PostForm("contactInfo")

	logger.Infof("title: %s, feedbackType: %s, content: %s, contactInfo: %s", title, feedbackType, content, contactInfo)

	// var addReq dto.AddFeedbackDTO
	// if err = controller.Bind(ctx, &addReq, binding.Form); err != nil {
	// 	logger.Infof("AddFeedback Bind error: %v", err)
	// 	controller.Error(ctx, "参数错误")
	// 	return
	// }
	// addReq.Status = dto.Pending.String()
	// // addReq.Attachments = attachments
	// addReq.UserID = common.GetLoginUserID()

	// var feedbackDTO *dto.FeedbackDTO
	// if feedbackDTO, err = services.AddFeedback(&addReq); err != nil {
	// 	logger.Infof("AddFeedback Bind error: %v", err)
	// 	controller.Error(ctx, err.Error())
	// 	return
	// }

	// controller.OK(ctx, feedbackDTO.ID)
	controller.OK(ctx, 1)
}

func getAttachments(files []*multipart.FileHeader) ([]*dto.AddAttachmentDTO, error) {
	attachments := make([]*dto.AddAttachmentDTO, 0)

	for _, file := range files {
		openedFile, err := file.Open()
		if err != nil {
			return nil, err
		}
		defer openedFile.Close()

		// 1. 读取前512字节检测MIME类型
		buffer := make([]byte, 512)
		n, err := openedFile.Read(buffer)
		if err != nil && err != io.EOF {
			return nil, err
		}
		mimeType := http.DetectContentType(buffer[:n])

		// 2. 重置文件指针到开头
		_, err = openedFile.Seek(0, io.SeekStart)
		if err != nil {
			return nil, err
		}

		// 3. 完整读取文件内容
		fileBytes, err := io.ReadAll(openedFile)
		if err != nil {
			return nil, err
		}

		attachment := &dto.AddAttachmentDTO{
			Data:     fileBytes,
			FileName: file.Filename,
			FileSize: int(file.Size),
			FileType: mimeType,
		}
		attachments = append(attachments, attachment)
	}

	return attachments, nil
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
	if feedbackDTO, err = updateFeedbackStatus(req.ID, dto.Processing.String()); err != nil {
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

// GetFeedbackStatusEnums
// @Description 获取反馈状态列表
// @Router /feedback/status/enums [put]
func GetFeedbackStatusEnums(ctx *gin.Context) {
	statusList := dto.GetAllStatuses()
	resp := make([]map[string]any, 0)
	for _, status := range statusList {
		statusMap := make(map[string]any)
		statusMap["value"] = status.String()
		statusMap["label"] = status.ToLabel()
		resp = append(resp, statusMap)
	}
	controller.OK(ctx, resp)
}

// GetFeedbackTypeEnums
// @Description 获取反馈类型列表
// @Router /feedback/type/enums [get]
func GetFeedbackTypeEnums(ctx *gin.Context) {
	feedbackTypeList := dto.GetAllFeedbackType()
	resp := make([]map[string]any, 0)
	for _, feedbackType := range feedbackTypeList {
		feedbackTypeMap := make(map[string]any)
		feedbackTypeMap["value"] = feedbackType.String()
		feedbackTypeMap["label"] = feedbackType.ToLabel()
		resp = append(resp, feedbackTypeMap)
	}
	controller.OK(ctx, resp)
}

// UserIsAdmin
// @Description 判断用户是否为管理员
// @Router /feedback/admin [get]
func UserIsAdmin(ctx *gin.Context) {
	userID := common.GetLoginUserID()
	if isAdmin(userID) {
		controller.OK(ctx, true)
	} else {
		controller.OK(ctx, false)
	}
}
