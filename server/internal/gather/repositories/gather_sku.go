package repositories

import (
	"server/common/middleware/database"
	"server/internal/gather/models"
)

var GatherSkuRepository = database.NewRepository[gatherSkuRepository]()

type gatherSkuRepository struct {
	database.Repository[*models.GatherSku]
}

func (r *gatherSkuRepository) GetGatherSkuListByBatchID(batchID uint64) ([]*models.GatherSku, error) {
	var err error

	sql := "select * from gather_sku where batch_id = ? and deleted_at is null"
	list, err := r.GetList(sql, batchID)
	if err != nil {
		return nil, err
	}
	return list, nil
}
