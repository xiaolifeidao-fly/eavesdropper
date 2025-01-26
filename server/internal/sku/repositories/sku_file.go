package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

type SkuFileInfoRepository struct {
	database.Repository[*models.SkuFileInfo]
}

func (r *SkuFileInfoRepository) FindBySkuItemId(skuItemId string) ([]*models.SkuFileInfo, error) {
	return r.GetList("select * from sku_file_info where sku_item_id = ?", skuItemId)
}

func (r *SkuFileInfoRepository) FindBySkuItemIdAndFileId(skuItemId string, fileId uint64) (*models.SkuFileInfo, error) {
	return r.GetOne("select * from sku_file_info where sku_item_id = ? and file_id = ?", skuItemId, fileId)
}

func (r *SkuFileInfoRepository) FindDetailBySkuItemId(skuItemId string) ([]*models.SkuFileDetail, error) {
	sql := "select f.id, f.sku_item_id, f.file_id, r.file_id as item_file_id, f.sort_id, r.file_type, r.file_url, r.file_name, r.file_size from sku_file_info f left join door_file_record r on r.id = f.file_id where f.sku_item_id = ?"
	entities, err := database.GetListByEntity(r.Db, sql, &models.SkuFileDetail{}, skuItemId)
	if err != nil {
		return nil, err
	}
	return entities, nil
}
