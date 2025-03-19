package repositories

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
)

var SkuTaskItemRepository = database.NewRepository[skuTaskItemRepository]()

type skuTaskItemRepository struct {
	database.Repository[*models.SkuTaskItem]
}

// GetStatusCountByTaskIDs 根据taskIDs获取任务项状态的数量
func (r *skuTaskItemRepository) GetStatusCountByTaskIDs(taskIDs []uint64) ([]*models.SkuTaskItemStatusCount, error) {
	var err error
	sql := `
	select task_id, status, count(id) as count
	from sku_task_item
	where task_id in (?)
	group by task_id, status
	`

	entities, err := database.GetListByEntity(r.Db, sql, &models.SkuTaskItemStatusCount{}, taskIDs)
	if err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *skuTaskItemRepository) GetItemListByTaskID(taskID uint64) ([]*models.SkuTaskItem, error) {
	sql := "select * from sku_task_item where deleted_at is null and task_id = ?"
	return r.GetList(sql, taskID)
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
