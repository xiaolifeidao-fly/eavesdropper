package services

import (
	"errors"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/feedback/models"
	"server/internal/feedback/repositories"
	"server/internal/feedback/services/dto"
)

func GetProcessesByFeedbackID(feedbackID uint64) ([]*dto.ProcessDTO, error) {
	var err error
	processRepository := repositories.ProcessRepository

	var processes []*models.Process
	if processes, err = processRepository.FindByFeedbackID(feedbackID); err != nil {
		logger.Errorf("GetProcessesByFeedbackID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}
	return database.ToDTOs[dto.ProcessDTO](processes), nil
}

func SaveOrUpdateProcess(processDTO *dto.ProcessDTO) (*dto.ProcessDTO, error) {
	var err error
	processRepository := repositories.ProcessRepository

	process := database.ToPO[models.Process](processDTO)
	if process, err = processRepository.SaveOrUpdate(process); err != nil {
		logger.Errorf("SaveOrUpdateProcess failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	return database.ToDTO[dto.ProcessDTO](process), nil
}
