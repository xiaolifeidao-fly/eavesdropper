package repositories

import (
	"server/common/middleware/database"
	"server/internal/gather/models"
)

var GatherSkuRepository = database.NewRepository[gatherSkuRepository]()

type gatherSkuRepository struct {
	database.Repository[*models.GatherSku]
}

func (r *gatherSkuRepository) GetGatherSkuListByBatchIDAndSkuName(batchID uint64, skuName string) ([]*models.GatherSku, error) {
	var err error

	sql := "select * from gather_sku where batch_id = ? and deleted_at is null"
	if skuName != "" {
		sql += " and name like '%" + skuName + "%'"
	}
	list, err := r.GetList(sql, batchID)
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (r *gatherSkuRepository) GetGatherSkuByID(id uint64) (*models.GatherSku, error) {
	var err error

	sql := "select * from gather_sku where id = ? and deleted_at is null"
	gatherSku, err := r.GetOne(sql, id)
	if err != nil {
		return nil, err
	}
	return gatherSku, nil
}

func (r *gatherSkuRepository) GetGatherSkuByBatchIDAndSkuID(batchID uint64, skuID string) (*models.GatherSku, error) {
	var err error

	sql := "select * from gather_sku where batch_id = ? and sku_id = ? and deleted_at is null"
	gatherSku, err := r.GetOne(sql, batchID, skuID)
	if err != nil {
		return nil, err
	}
	return gatherSku, nil
}

func (r *gatherSkuRepository) CountGatherSku(batchID uint64) (int, int, error) {
	var err error

	sql := "select * from gather_sku where batch_id = ? and deleted_at is null"
	list, err := r.GetList(sql, batchID)
	if err != nil {
		return 0, 0, err
	}

	total := len(list)
	favoriteTotal := 0
	for _, item := range list {
		if item.Favorite {
			favoriteTotal++
		}
	}
	return total, favoriteTotal, nil
}

func (r *gatherSkuRepository) GetFavoriteGatherSkuListByBatchID(batchID uint64) ([]*models.GatherSku, error) {
	var err error

	sql := "select * from gather_sku where batch_id = ? and favorite = true and deleted_at is null"
	list, err := r.GetList(sql, batchID)
	if err != nil {
		return nil, err
	}

	return list, nil
}
