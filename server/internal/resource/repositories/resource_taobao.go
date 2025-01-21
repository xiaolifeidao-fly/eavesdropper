package repositories

import (
	"server/common/middleware/database"
	"server/internal/resource/models"
)

var ResourceTaobaoRepository = database.NewRepository[resourceTaobaoRepository]()

type resourceTaobaoRepository struct {
	database.Repository[*models.ResourceTaobao]
}

func (r *resourceTaobaoRepository) FindByResourceId(resourceId uint64) (*models.ResourceTaobao, error) {
	var err error
	var resourceTaobao *models.ResourceTaobao
	if resourceTaobao, err = r.GetOne("select * from resource_taobao where resource_id = ? and deleted_at is null", resourceId); err != nil {
		return nil, err
	}
	return resourceTaobao, nil
}
