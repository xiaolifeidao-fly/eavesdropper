package models

import (
	"server/common/middleware/database"
)

type Process struct {
	database.BaseEntity
	FeedbackID uint64 `json:"feebackId"`
	UserID     uint64 `json:"userId"`
	Result     string `json:"result"`
}

func (r *Process) TableName() string {
	return "feedback_process"
}
