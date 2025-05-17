package dto

import (
	"server/common"
	"server/common/base/dto"
	"server/common/converter"
)

type AttachmentDTO struct {
	dto.BaseDTO
	FeedbackID uint64 `json:"feebackId"`
	FileUrl    string `json:"fileUrl"`
	FileType   string `json:"fileType"`
	FileName   string `json:"fileName"`
	FileSize   int    `json:"fileSize"`
}

type AddAttachmentDTO struct {
	FeedbackID uint64  `json:"feedbackId"`
	Data       []uint8 `json:"data"`
	FileType   string  `json:"fileType"`
	FileName   string  `json:"fileName"`
	FileSize   int     `json:"fileSize"`
}

func (d *AddAttachmentDTO) ToAttachmentDTO() *AttachmentDTO {
	feedbackDTO := &AttachmentDTO{}
	converter.Copy(feedbackDTO, d)
	feedbackDTO.CreatedBy = common.GetLoginUserID()
	feedbackDTO.UpdatedBy = common.GetLoginUserID()
	return feedbackDTO
}
