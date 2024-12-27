package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuTaskItemRepository = database.NewRepository[skuTaskItemRepository]()

type skuTaskItemRepository struct {
	database.Repository[*models.SkuTaskItem]
}
