package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

type SkuDraftRepository struct {
	database.Repository[*models.SkuDraft]
}

func (r *SkuDraftRepository) GetSkuDraft(resourceId int64, skuItemId string) (*models.SkuDraft, error) {
	sql := "SELECT * FROM sku_draft WHERE resource_id = ? AND sku_item_id = ?"
	return r.GetOne(sql, resourceId, skuItemId)
}
