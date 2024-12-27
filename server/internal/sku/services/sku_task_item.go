package services

import (
	"errors"
	"server/common"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

func BatchAddSkuTaskItem(addSkuTaskItemDTOs []*dto.AddSkuTaskItemDTO) error {
	var err error

	if len(addSkuTaskItemDTOs) == 0 {
		return nil
	}

	itemDTOs := make([]*dto.SkuTaskItemDTO, 0)
	for _, addSkuTaskItemDTO := range addSkuTaskItemDTOs {
		var itemDTO dto.SkuTaskItemDTO
		converter.Copy(&itemDTO, addSkuTaskItemDTO)
		itemDTO.CreatedBy = common.GetLoginUserID()
		itemDTO.UpdatedBy = common.GetLoginUserID()
		itemDTOs = append(itemDTOs, &itemDTO)
	}

	if _, err = batchSaveSkuTaskItem(itemDTOs); err != nil {
		return err
	}

	return nil
}

func batchSaveSkuTaskItem(itemDTOs []*dto.SkuTaskItemDTO) ([]*dto.SkuTaskItemDTO, error) {
	var err error
	skuTaskItemRepository := repositories.SkuTaskItemRepository

	items := database.ToPOs[models.SkuTaskItem](itemDTOs)
	if items, err = skuTaskItemRepository.BatchCreate(items); err != nil {
		logger.Errorf("batchSaveSkuTaskItem failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	itemDTOs = database.ToDTOs[dto.SkuTaskItemDTO](items)
	return itemDTOs, nil
}
