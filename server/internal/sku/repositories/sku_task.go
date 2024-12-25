package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuTaskRepository = database.NewRepository[skuTaskRepository]()

type skuTaskRepository struct {
	database.Repository[*models.SkuTask]
}
