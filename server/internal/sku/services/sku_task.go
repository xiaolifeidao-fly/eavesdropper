package services

import (
	"errors"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

func CreateSkuTask(skuTaskDTO *dto.SkuTaskDTO) (uint64, error) {
	var err error

	if skuTaskDTO, err = saveSkuTask(skuTaskDTO); err != nil {
		return 0, err
	}

	return skuTaskDTO.ID, nil
}

func UpdateSkuTask(skuTaskDTO *dto.SkuTaskDTO) error {
	var err error

	if _, err = updateSkuTask(skuTaskDTO); err != nil {
		return err
	}

	return nil
}

func saveSkuTask(skuTaskDTO *dto.SkuTaskDTO) (*dto.SkuTaskDTO, error) {
	var err error
	skuRepository := repositories.SkuTaskRepository

	skuTask := database.ToPO[models.SkuTask](skuTaskDTO)
	if skuTask, err = skuRepository.Create(skuTask); err != nil {
		logger.Errorf("saveSkuTask failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	skuTaskDTO = database.ToDTO[dto.SkuTaskDTO](skuTask)
	return skuTaskDTO, nil
}

func updateSkuTask(skuTaskDTO *dto.SkuTaskDTO) (*dto.SkuTaskDTO, error) {
	var err error
	skuRepository := repositories.SkuTaskRepository

	skuTask := database.ToPO[models.SkuTask](skuTaskDTO)
	if skuTask, err = skuRepository.SaveOrUpdate(skuTask); err != nil {
		logger.Errorf("updateSkuTask failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	skuTaskDTO = database.ToDTO[dto.SkuTaskDTO](skuTask)
	return skuTaskDTO, nil
}
