package services

import (
	"errors"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/resource/models"
	"server/internal/resource/repositories"
	"server/internal/resource/services/dto"
)

func CreateBindingRecord(record *dto.ResourceTokenBindingRecordDTO) (*dto.ResourceTokenBindingRecordDTO, error) {
	var err error
	recordRepository := repositories.ResourceTokenBindingRecordRepository

	bindingRecord := database.ToPO[models.ResourceTokenBindingRecord](record)
	if bindingRecord, err = recordRepository.Create(bindingRecord); err != nil {
		logger.Errorf("CreateBindingRecord failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	recordDTO := database.ToDTO[dto.ResourceTokenBindingRecordDTO](bindingRecord)
	return recordDTO, nil
}
