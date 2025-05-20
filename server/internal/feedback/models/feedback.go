package models

import (
	"server/common/middleware/database"
)

type Feedback struct {
	database.BaseEntity
	UserID       uint64 `json:"userId"`
	FeedbackType string `json:"feedbackType"`
	Title        string `json:"title"`
	Content      string `json:"content"`
	Status       string `json:"status"`
	ContactInfo  string `json:"contactInfo"`
}

func (r *Feedback) TableName() string {
	return "feedback"
}
