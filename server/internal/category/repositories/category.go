package repositories

import (
	"server/common/middleware/database"
	"server/internal/category/models"
)

var CategoryRepositories = database.NewRepository[categoryRepositories]()

type categoryRepositories struct {
	database.Repository[*models.Category]
}

func (c *categoryRepositories) FindByTbID(tbID uint64) (*models.Category, error) {
	var err error

	var entity *models.Category
	if entity, err = c.GetOne("select * from category where tb_id = ?", tbID); err != nil {
		return nil, err
	}
	return entity, nil
}

func (c *categoryRepositories) FindByTbIDs(tbIDs []uint64) ([]*models.Category, error) {
	var err error

	var entities []*models.Category
	if entities, err = c.GetList("select * from category where tb_id = ? and deleted_at is null", tbIDs); err != nil {
		return nil, err
	}
	return entities, nil
}
