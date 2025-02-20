package repositories

import (
	"server/common/middleware/database"
	"server/internal/shop/models"
)

var ShopRepository = database.NewRepository[shopRepository]()

type shopRepository struct {
	database.Repository[*models.Shop]
}

func (r *shopRepository) FindByUserIDAndResourceID(userID uint64, resourceID uint64) (*models.Shop, error) {
	var err error
	var shop *models.Shop
	if shop, err = r.GetOne("select * from shop where user_id = ? and resource_id = ? and deleted_at is null", userID, resourceID); err != nil {
		return nil, err
	}
	return shop, nil
}

func (r *shopRepository) FindByUserID(userID uint64) ([]*models.Shop, error) {
	return r.GetList("select * from shop where user_id = ? and deleted_at is null", userID)
}

func (r *shopRepository) FindByResourceID(resourceID uint64) (*models.Shop, error) {
	return r.GetOne("select * from shop where resource_id = ? and deleted_at is null", resourceID)
}
