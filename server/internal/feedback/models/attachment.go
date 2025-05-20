package models

import (
	"server/common/middleware/database"
)

type Attachment struct {
	database.BaseEntity
	FeedbackID uint64 `json:"feebackId"`
	FileUrl    string `json:"fileUrl"`
	FileType   string `json:"fileType"`
	FileName   string `json:"fileName"`
	FileSize   int    `json:"fileSize"`
}

func (r *Attachment) TableName() string {
	return "feedback_attachment"
}
