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

type DoorFileRecordRepository struct {
	database.Repository[*models.DoorFileRecord]
}

func (r *DoorFileRecordRepository) FindBySourceAndFileId(source string, fileId string, resourceId uint64) (*models.DoorFileRecord, error) {
	return r.GetOne("select * from door_file_record where source = ? and file_id = ? and resource_id = ?", source, fileId, resourceId)
}

func (r *DoorFileRecordRepository) FindBySourceAndResourceIdAndFileKey(source string, resourceId uint64, fileKey string) (*models.DoorFileRecord, error) {
	return r.GetOne("select * from door_file_record where source = ? and resource_id = ? and file_key = ?", source, resourceId, fileKey)
}
