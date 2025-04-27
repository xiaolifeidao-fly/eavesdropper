package services

import (
	"errors"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/gather/models"
	"server/internal/gather/repositories"
	"server/internal/gather/services/dto"
)

func AddGatherSku(addDto *dto.GatherSkuDTO) (*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	gatherSku := database.ToPO[models.GatherSku](addDto)
	if _, err = gatherRepository.Create(gatherSku); err != nil {
		logger.Errorf("AddGatherSku failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	addDto = database.ToDTO[dto.GatherSkuDTO](gatherSku)
	return addDto, nil
}

func GetGatherSkuByID(id uint64) (*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	var gatherSku *models.GatherSku
	if gatherSku, err = gatherRepository.GetGatherSkuByID(id); err != nil {
		logger.Errorf("GetGatherSkuByID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	gatherSkuDTO := database.ToDTO[dto.GatherSkuDTO](gatherSku)
	return gatherSkuDTO, nil
}

func UpdateGatherSku(gatherSku *dto.GatherSkuDTO) (*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	gatherSkuPO := database.ToPO[models.GatherSku](gatherSku)
	if _, err = gatherRepository.SaveOrUpdate(gatherSkuPO); err != nil {
		logger.Errorf("UpdateGatherSku failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	gatherSkuDTO := database.ToDTO[dto.GatherSkuDTO](gatherSkuPO)
	return gatherSkuDTO, nil
}

func GetGatherSkuListByBatchID(batchID uint64, skuName string) ([]*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	var gatherSkuList []*models.GatherSku
	if gatherSkuList, err = gatherRepository.GetGatherSkuListByBatchIDAndSkuName(batchID, skuName); err != nil {
		logger.Errorf("GetGatherSkuListByBatchID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	gatherSkuDTOList := database.ToDTOs[dto.GatherSkuDTO](gatherSkuList)
	return gatherSkuDTOList, nil
}

func GetGatherSkuListByBatchIDAndSkuID(batchID uint64, skuID string) (*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	var gatherSku *models.GatherSku
	if gatherSku, err = gatherRepository.GetGatherSkuByBatchIDAndSkuID(batchID, skuID); err != nil {
		logger.Errorf("GetGatherSkuByBatchIDAndSkuID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	gatherSkuDTO := database.ToDTO[dto.GatherSkuDTO](gatherSku)
	return gatherSkuDTO, nil
}
