package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuTaskItemRepository = database.NewRepository[skuTaskItemRepository]()

type skuTaskItemRepository struct {
	database.Repository[*models.SkuTaskItem]
}

type SkuTaskStepRepository struct {
	database.Repository[*models.SkuTaskStep]
}

func (s *SkuTaskStepRepository) FindByKeyAndResourceIdAndCode(key string, resourceId uint64, code string) (*models.SkuTaskStep, error) {
	sql := "SELECT * FROM sku_task_step WHERE step_key = ? AND resource_id = ? AND code = ?"
	return s.GetOne(sql, key, resourceId, code)
}

func (s *SkuTaskStepRepository) FindByKeyAndResourceIdAndGroupCode(key string, resourceId uint64, groupCode string) ([]*models.SkuTaskStep, error) {
	sql := "SELECT * FROM sku_task_step WHERE step_key = ? AND resource_id = ? AND group_code = ?"
	return s.GetList(sql, key, resourceId, groupCode)
}

func (s *SkuTaskStepRepository) DeleteByKeyAndResourceIdAndGroupCode(key string, resourceId uint64, groupCode string) error {
	sql := "DELETE FROM sku_task_step WHERE step_key = ? AND resource_id = ? AND group_code = ?"
	return s.Execute(sql, key, resourceId, groupCode)
}
