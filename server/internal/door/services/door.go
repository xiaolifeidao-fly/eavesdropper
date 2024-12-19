package services

import (
	"server/common/base"
	"server/common/middleware/database"
	"server/internal/door/models"
	"server/internal/door/repositories"
	"server/internal/door/services/dto"
	"time"
)

var doorRecordRepository = database.NewRepository[repositories.DoorRecordRepository]()

func FindByDoorKeyAndItemKeyAndType(doorKey string, itemKey string, itemType string) (*dto.DoorRecordDTO, error) {
	doorRecord, err := doorRecordRepository.FindByDoorKeyAndItemKeyAndType(doorKey, itemKey, itemType)
	if err != nil {
		return nil, err
	}
	now := base.Now()
	if doorRecord == nil || doorRecord.ExpireTime.ToTime().Before(now.ToTime()) {
		return nil, nil
	}
	return database.ToDTO[dto.DoorRecordDTO](doorRecord), nil
}

func CreateDoorRecord(doorRecordDTO *dto.DoorRecordDTO) (*dto.DoorRecordDTO, error) {
	doorRecord, err := doorRecordRepository.FindByDoorKeyAndItemKeyAndType(doorRecordDTO.DoorKey, doorRecordDTO.ItemKey, doorRecordDTO.Type)
	if err != nil {
		return nil, err
	}
	if doorRecord == nil {
		doorRecord = database.ToPO[models.DoorRecord](doorRecordDTO)
	}
	now := base.Now()
	doorRecord.ExpireTime = base.Time(now.ToTime().Add(time.Hour * 24 * 30))
	doorRecord.UpdatedAt = now
	doorRecord.Data = doorRecordDTO.Data
	doorRecordPO, err := doorRecordRepository.SaveOrUpdate(doorRecord)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorRecordDTO](doorRecordPO), nil
}
