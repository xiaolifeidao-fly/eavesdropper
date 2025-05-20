package repositories

import (
	"server/common/middleware/database"
	"server/internal/feedback/models"
)

var AttachmentRepository = database.NewRepository[attachmentRepository]()

type attachmentRepository struct {
	database.Repository[*models.Attachment]
}

func (r *attachmentRepository) FindByFeedbackID(feedbackID uint64) ([]*models.Attachment, error) {
	var err error

	sql := "select * from feedback_attachment where feedback_id = ? and deleted_at is null"
	attachments := make([]*models.Attachment, 0)
	if attachments, err = r.GetList(sql, feedbackID); err != nil {
		return nil, err
	}
	return attachments, nil
}
