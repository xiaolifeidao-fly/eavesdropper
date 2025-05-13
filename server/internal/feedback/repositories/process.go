package repositories

import (
	"server/common/middleware/database"
	"server/internal/feedback/models"
)

var ProcessRepository = database.NewRepository[processRepository]()

type processRepository struct {
	database.Repository[*models.Process]
}

func (r *processRepository) FindByFeedbackID(feedbackID uint64) ([]*models.Process, error) {
	var err error

	sql := "select * from feedback_process where feedback_id = ? and deleted_at is null"
	processes := make([]*models.Process, 0)
	if processes, err = r.GetList(sql, feedbackID); err != nil {
		return nil, err
	}
	return processes, nil
}
