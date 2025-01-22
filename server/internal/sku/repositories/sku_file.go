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

func (r *SkuFileInfoRepository) FindDetailBySkuId(skuId uint64) ([]*models.SkuFileDetail, error) {
	sql := "select f.id, f.sku_id, f.file_id, f.sort_id, r.file_type, r.file_url, r.file_name, r.file_size from sku_file_info f left join door_file_record r on r.id = f.file_id where f.sku_id = ?"
	entities, err := database.GetListByEntity(r.Db, sql, &models.SkuFileDetail{}, skuId)
	if err != nil {
		return nil, err
	}
	return entities, nil
}
