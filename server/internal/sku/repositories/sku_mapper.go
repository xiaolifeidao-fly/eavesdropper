package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

type SkuMapperRepository struct {
	database.Repository[*models.SkuMapper]
}

func (s *SkuMapperRepository) FindBySkuIdAndTbSkuSaleInfo(skuId string, tbSkuSaleInfo string) (*models.SkuMapper, error) {
	sql := "SELECT * FROM sku_mapper WHERE sku_id = ? AND tb_sku_sale_info = ?"
	return s.GetOne(sql, skuId, tbSkuSaleInfo)
}
