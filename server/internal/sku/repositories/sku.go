package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuRepository = database.NewRepository[skuRepository]()

type skuRepository struct {
	database.Repository[*models.Sku]
}

func (r *skuRepository) GetSkuByPublishResourceIdAndSourceSkuIdAndSource(publishResourceId uint64, sourceSkuId, source string) (*models.Sku, error) {
	return r.GetOne("select * from sku where publish_resource_id = ? and source_sku_id = ? and source = ? and deleted_at is null", publishResourceId, sourceSkuId, source)
}

func (r *skuRepository) GetSkuByPublishResourceIdAndPublishSkuIdAndStatus(publishResourceId uint64, publishSkuId string, status string) (*models.Sku, error) {
	return r.GetOne("select * from sku where publish_resource_id = ? and publish_sku_id = ? and status = ? and deleted_at is null order by id desc limit 1", publishResourceId, publishSkuId, status)
}

func (r *skuRepository) GetByID(id uint64) (*models.Sku, error) {
	sql := "select * from sku where deleted_at is null and id = ?"
	return r.GetOne(sql, id)
}
