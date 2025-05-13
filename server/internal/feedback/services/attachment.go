package services

import (
	"errors"
	"fmt"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/middleware/storage/oss"
	"server/internal/feedback/models"
	"server/internal/feedback/repositories"
	"server/internal/feedback/services/dto"
)

const (
	AttachmentFilePrefix = "feedback"
)

func AddAttachment(req *dto.AddAttachmentDTO) (*dto.AttachmentDTO, error) {
	var err error
	var attachmentRepository = repositories.AttachmentRepository
	attachmentDTO := req.ToAttachmentDTO()

	// 调用AliyunOss上传文件
	fileUrl := getAttachmentFileUrl(req.FeedbackID, req.FileName)
	if err = oss.Put(fileUrl, req.Data); err != nil {
		logger.Errorf("AddAttachment failed, with error is %v, param: %v", err, req)
	}
	attachmentDTO.FileUrl = fileUrl

	attachment := database.ToPO[models.Attachment](attachmentDTO)
	if attachment, err = attachmentRepository.SaveOrUpdate(attachment); err != nil {
		logger.Errorf("AddAttachment failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}
	attachmentDTO = database.ToDTO[dto.AttachmentDTO](attachment)
	return attachmentDTO, nil
}

func getAttachmentFileUrl(feedbackID uint64, fileName string) string {
	return fmt.Sprintf("%s/%d/%s.json", AttachmentFilePrefix, feedbackID, fileName)
}

func GetAttachmentByFeedbackID(feedbackID uint64) ([]*dto.AttachmentDTO, error) {
	var err error
	var attachmentRepository = repositories.AttachmentRepository

	var attachments []*models.Attachment
	if attachments, err = attachmentRepository.FindByFeedbackID(feedbackID); err != nil {
		logger.Errorf("GetAttachmentByFeedbackID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}
	return database.ToDTOs[dto.AttachmentDTO](attachments), nil
}
