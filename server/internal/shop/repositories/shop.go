package repositories

import (
	"server/common/middleware/database"
	"server/internal/shop/models"
)

var ShopRepository = database.NewRepository[shopRepository]()

type shopRepository struct {
	database.Repository[*models.Shop]
}
