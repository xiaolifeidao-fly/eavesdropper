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
