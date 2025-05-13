package dto

import (
	"server/common"
	"server/common/base"
	"server/common/base/dto"
	"server/common/base/page"
	"server/common/converter"
)

// 定义反馈类型枚举
type FeedbackType string

const (
	// 功能问题
	FunctionalIssue FeedbackType = "FunctionalIssue"
	// 错误报告
	ErrorReport FeedbackType = "ErrorReport"
	// 功能建议
	FeatureSuggestion FeedbackType = "FeatureSuggestion"
	// 投诉
	Complaint FeedbackType = "Complaint"
	// 其他
	Other FeedbackType = "Other"
)

// 为FeedbackType实现String方法，方便打印和输出
func (f FeedbackType) String() string {
	switch f {
	case FunctionalIssue:
		return "功能问题"
	case ErrorReport:
		return "错误报告"
	case FeatureSuggestion:
		return "功能建议"
	case Complaint:
		return "投诉"
	case Other:
		return "其他"
	default:
		return "未知类型"
	}
}

// GetAllFeedbackType 返回所有反馈类型的切片
func GetAllFeedbackType() []FeedbackType {
	return []FeedbackType{
		FunctionalIssue,
		ErrorReport,
		FeatureSuggestion,
		Complaint,
		Other,
	}
}

// FeedbackStatus 表示工单或反馈的状态
type FeedbackStatus string

const (
	// Pending 待处理
	Pending FeedbackStatus = "Pending" // 从1开始
	// Processing 处理中
	Processing FeedbackStatus = "Processing"
	// Resolved 已解决
	Resolved FeedbackStatus = "Resolved"
)

// String 返回状态的字符串表示
func (s FeedbackStatus) String() string {
	switch s {
	case Pending:
		return "pending"
	case Processing:
		return "processing"
	case Resolved:
		return "resolved"
	default:
		return "unknown"
	}
}

// GetAllStatuses 返回所有状态
func GetAllStatuses() []FeedbackStatus {
	return []FeedbackStatus{Pending, Processing, Resolved}
}

type FeedbackDTO struct {
	dto.BaseDTO
	UserID       uint64 `json:"userId"`
	FeedbackType string `json:"feedbackType"`
	Title        string `json:"title"`
	Content      string `json:"content"`
	Status       string `json:"status"`
	ContactInfo  string `json:"contactInfo"`
}

type AddFeedbackDTO struct {
	UserID       uint64              `json:"userId"`
	FeedbackType string              `json:"feedbackType"`
	Title        string              `json:"title"`
	Content      string              `json:"content"`
	Status       string              `json:"status"`
	ContactInfo  string              `json:"contactInfo"`
	Attachments  []*AddAttachmentDTO `json:"attachments"`
}

func (d *AddFeedbackDTO) ToFeedbackDTO() *FeedbackDTO {
	feedbackDTO := &FeedbackDTO{}
	converter.Copy(feedbackDTO, d)
	feedbackDTO.CreatedBy = common.GetLoginUserID()
	feedbackDTO.UpdatedBy = common.GetLoginUserID()
	return feedbackDTO
}

type FeedbackPageParamDTO struct {
	page.Query `search:"-"`
	UserID     uint64 `search:"type:eq;table:feedback;column:user_id"`
	Status     string `form:"status" search:"type:eq;table:feedback;column:status"`
	_          any    `search:"type:order;table:feedback;column:id;default:desc"`
	_          any    `search:"type:isNull;table:feedback;column:deleted_at"`
}

type FeedbackPageDTO struct {
	ID           uint64    `json:"id" select:"table:feedback;column:id"`
	UserID       uint64    `json:"userId" select:"table:feedback;column:user_id"`
	Title        string    `json:"title" select:"table:feedback;column:title"`
	FeedbackType string    `json:"feedbackType" select:"table:feedback;column:feedback_type"`
	CreatedAt    base.Time `json:"createdAt" select:"table:feedback;column:created_at"`
	Status       string    `json:"status" select:"table:feedback;column:status"`
}

type FeedbackInfoDTO struct {
	ID           uint64           `json:"id"`
	UserID       uint64           `json:"userId"`
	FeedbackType string           `json:"feedbackType"`
	Title        string           `json:"title"`
	Content      string           `json:"content"`
	Status       string           `json:"status"`
	ContactInfo  string           `json:"contactInfo"`
	Attachments  []*AttachmentDTO `json:"attachments"`
	Processes    []*ProcessDTO    `json:"processes"`
}
