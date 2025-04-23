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

func GetGatherSkuListByBatchID(batchID uint64) ([]*dto.GatherSkuDTO, error) {
	var err error
	gatherRepository := repositories.GatherSkuRepository

	var gatherSkuList []*models.GatherSku
	if gatherSkuList, err = gatherRepository.GetGatherSkuListByBatchID(batchID); err != nil {
		logger.Errorf("GetGatherSkuListByBatchID failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	gatherSkuDTOList := database.ToDTOs[dto.GatherSkuDTO](gatherSkuList)
	return gatherSkuDTOList, nil
}
