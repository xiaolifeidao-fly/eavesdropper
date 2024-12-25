package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuRepository = database.NewRepository[skuRepository]()

type skuRepository struct {
	database.Repository[*models.Sku]
}
