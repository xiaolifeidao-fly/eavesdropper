package repositories

import (
	"server/common/middleware/database"
	"server/internal/door/models"
)

type DoorRecordRepository struct {
	database.Repository[*models.DoorRecord]
}

func (r *DoorRecordRepository) FindByDoorKeyAndItemKeyAndType(doorKey string, itemKey string, itemType string) (*models.DoorRecord, error) {
	return r.GetOne("select * from door_record where door_key = ? and item_key = ? and type = ?", doorKey, itemKey, itemType)
}
