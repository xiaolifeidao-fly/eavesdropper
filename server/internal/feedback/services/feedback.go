package services

import (
	"errors"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/feedback/models"
	"server/internal/feedback/repositories"
	"server/internal/feedback/services/dto"
)

func AddFeedback(req *dto.AddFeedbackDTO) (*dto.FeedbackDTO, error) {
	var err error
	feedbackRepository := repositories.FeedbackRepository

	// 保存反馈信息
	feedbackDTO := req.ToFeedbackDTO()
	feedback := database.ToPO[models.Feedback](feedbackDTO)
	if feedback, err = feedbackRepository.SaveOrUpdate(feedback); err != nil {
		logger.Errorf("AddFeedback failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	feedbackDTO = database.ToDTO[dto.FeedbackDTO](feedback)
	if req.Attachments == nil || len(req.Attachments) == 0 {
		return feedbackDTO, nil
	}

	// 保存反馈附件
	for _, attachment := range req.Attachments {
		attachment.FeedbackID = feedbackDTO.ID
		if _, err = AddAttachment(attachment); err != nil {
			logger.Errorf("AddFeedback failed, with error is %v", err)
		}
	}

	return feedbackDTO, nil
}

func PageFeedback(param *dto.FeedbackPageParamDTO) (*page.Page[dto.FeedbackPageDTO], error) {
	var err error
	feedbackRepository := repositories.FeedbackRepository

	var count int64
	var pageData = make([]*dto.FeedbackPageDTO, 0)
	if err = feedbackRepository.Page(&models.Feedback{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.FeedbackPageDTO](param.ToPageInfo(count)), nil
	}

	for _, feedback := range pageData {
		feedback.FeedbackTypeLabel = dto.GetFeedbackTypeByCode(feedback.FeedbackType).ToLabel()
		feedback.StatusLabel = dto.GetFeedbackStatusByCode(feedback.Status).ToLabel()
	}

	pageDTO := page.BuildPage(param.ToPageInfo(count), pageData)
	return pageDTO, nil
}

func GetFeedbackInfo(ID uint64) (*dto.FeedbackInfoDTO, error) {
	var err error
	feedbackRepository := repositories.FeedbackRepository

	var feedback *models.Feedback
	if feedback, err = feedbackRepository.FindById(ID); err != nil {
		logger.Errorf("GetFeedbackInfo failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}
	feedbackID := feedback.ID
	if feedback == nil || feedbackID == 0 {
		return nil, nil
	}

	var feedbackInfoDTO = &dto.FeedbackInfoDTO{}
	converter.Copy(feedbackInfoDTO, feedback)
	feedbackInfoDTO.FeedbackTypeLabel = dto.GetFeedbackTypeByCode(feedbackInfoDTO.FeedbackType).ToLabel()
	feedbackInfoDTO.StatusLabel = dto.GetFeedbackStatusByCode(feedbackInfoDTO.Status).ToLabel()

	// 获取附件列表
	var attachmentList []*dto.AttachmentDTO
	if attachmentList, err = GetAttachmentByFeedbackID(feedbackID); err != nil {
		return nil, err
	}
	for _, attachment := range attachmentList {
		fileUrl := attachment.FileUrl
		// 构建文件访问路径
		attachment.FileUrl = fileUrl
	}
	feedbackInfoDTO.Attachments = attachmentList

	// 获取处理记录
	var processes []*dto.ProcessDTO
	if processes, err = GetProcessesByFeedbackID(feedbackID); err != nil {
		return nil, err
	}
	feedbackInfoDTO.Processes = processes

	return feedbackInfoDTO, nil
}

func GetFeedbackByID(ID uint64) (*dto.FeedbackDTO, error) {
	var err error
	feedbackRepository := repositories.FeedbackRepository

	var feedback *models.Feedback
	if feedback, err = feedbackRepository.FindById(ID); err != nil {
		logger.Errorf("GetFeedbackByID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	return database.ToDTO[dto.FeedbackDTO](feedback), err
}

func SaveOrUpdateFeedback(feedbackDTO *dto.FeedbackDTO) (*dto.FeedbackDTO, error) {
	var err error
	feedbackRepository := repositories.FeedbackRepository

	feedback := database.ToPO[models.Feedback](feedbackDTO)
	if feedback, err = feedbackRepository.SaveOrUpdate(feedback); err != nil {
		logger.Errorf("SaveOrUpdateFeedback failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	return database.ToDTO[dto.FeedbackDTO](feedback), err
}
