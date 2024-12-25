package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

type SkuFileInfoRepository struct {
	database.Repository[*models.SkuFileInfo]
}

func (r *SkuFileInfoRepository) FindBySkuId(skuId uint64) ([]*models.SkuFileInfo, error) {
	return r.GetList("select * from sku_file_info where sku_id = ?", skuId)
}

func (r *SkuFileInfoRepository) FindBySkuIdAndFileId(skuId uint64, fileId uint64) (*models.SkuFileInfo, error) {
	return r.GetOne("select * from sku_file_info where sku_id = ? and file_id = ?", skuId, fileId)
}
