package repositories

import (
	"server/common/middleware/database"
	"server/internal/gather/models"
	"time"
)

var GatherBatchRepository = database.NewRepository[gatherBatchRepository]()

type gatherBatchRepository struct {
	database.Repository[*models.GatherBatch]
}

func (r *gatherBatchRepository) GetTodayGatherBatchNoCount(userId uint64, source string) (int64, error) {
	var err error

	sql := "select * from gather_batch where source = ? and created_at >= ? and user_id = ?"
	list, err := r.GetList(sql, source, time.Now().Format("2006-01-02"), userId)
	if err != nil {
		return 0, err
	}
	return int64(len(list)), nil
}
