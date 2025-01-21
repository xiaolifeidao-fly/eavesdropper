package repositories

import (
	"server/common/middleware/database"
	"server/internal/resource/models"
)

var ResourceRepository = database.NewRepository[resourceRepository]()

type resourceRepository struct {
	database.Repository[*models.Resource]
}

func (r *resourceRepository) GetResourceByUserIDAndTag(userID uint64, tag string) ([]*models.Resource, error) {
	var err error

	var resources []*models.Resource
	if resources, err = r.GetList("select * from resource where tag = ? and user_id = ? and deleted_at is null", tag, userID); err != nil {
		return nil, err
	}
	return resources, nil
}
