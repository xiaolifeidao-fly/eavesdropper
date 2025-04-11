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

func BatchAddSkuTaskItem(addSkuTaskItemDTOs []*dto.AddSkuTaskItemDTO) ([]*dto.SkuTaskItemDTO, error) {
	var err error

	if len(addSkuTaskItemDTOs) == 0 {
		return nil, nil
	}

	itemDTOs := make([]*dto.SkuTaskItemDTO, 0)
	for _, addSkuTaskItemDTO := range addSkuTaskItemDTOs {
		var itemDTO dto.SkuTaskItemDTO
		converter.Copy(&itemDTO, addSkuTaskItemDTO)
		itemDTO.CreatedBy = common.GetLoginUserID()
		itemDTO.UpdatedBy = common.GetLoginUserID()
		itemDTOs = append(itemDTOs, &itemDTO)
	}

	if itemDTOs, err = batchSaveSkuTaskItem(itemDTOs); err != nil {
		return nil, err
	}

	return itemDTOs, nil
}

func BatchUpdateSkuTaskItem(addSkuTaskItemDTOs []*dto.AddSkuTaskItemDTO) ([]*dto.SkuTaskItemDTO, error) {
	var err error

	if len(addSkuTaskItemDTOs) == 0 {
		return nil, nil
	}

	itemDTOs := make([]*dto.SkuTaskItemDTO, 0)
	for _, addSkuTaskItemDTO := range addSkuTaskItemDTOs {
		var itemDTO *dto.SkuTaskItemDTO
		if itemDTO, err = GetSkuTaskItemByID(addSkuTaskItemDTO.ID); err != nil {
			return nil, err
		}

		if itemDTO == nil || itemDTO.ID == 0 {
			itemDTO = &dto.SkuTaskItemDTO{}
			itemDTO.CreatedBy = common.GetLoginUserID()
		}
		converter.Copy(&itemDTO, addSkuTaskItemDTO)
		itemDTO.UpdatedBy = common.GetLoginUserID()
		itemDTOs = append(itemDTOs, itemDTO)
	}

	if itemDTOs, err = batchUpdateSkuTaskItem(itemDTOs); err != nil {
		return nil, err
	}

	return itemDTOs, nil
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

func batchUpdateSkuTaskItem(itemDTOs []*dto.SkuTaskItemDTO) ([]*dto.SkuTaskItemDTO, error) {
	var err error
	skuTaskItemRepository := repositories.SkuTaskItemRepository

	items := database.ToPOs[models.SkuTaskItem](itemDTOs)
	if items, err = skuTaskItemRepository.BatchUpdate(items); err != nil {
		logger.Errorf("batchUpdateSkuTaskItem failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	return itemDTOs, nil
}

func GetSkuTaskItemByID(id uint64) (*dto.SkuTaskItemDTO, error) {
	var err error
	skuTaskItemRepository := repositories.SkuTaskItemRepository

	var item *models.SkuTaskItem
	if item, err = skuTaskItemRepository.GetByID(id); err != nil {
		logger.Errorf("GetSkuTaskItemByID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	return database.ToDTO[dto.SkuTaskItemDTO](item), nil
}

var skuTaskStepRepository = database.NewRepository[repositories.SkuTaskStepRepository]()

func SaveSkuTaskStep(stepDTO *dto.SkuTaskStepDTO) (*dto.SkuTaskStepDTO, error) {
	dbStep, err := skuTaskStepRepository.FindByKeyAndResourceIdAndCode(stepDTO.TaskId, stepDTO.StepKey, stepDTO.ResourceId, stepDTO.Code)
	if err != nil {
		return nil, err
	}
	if dbStep != nil {
		dbStep.ValidateUrl = stepDTO.ValidateUrl
		dbStep.Status = stepDTO.Status
		dbStep.Message = stepDTO.Message
		dbStep.NeedNextSkip = stepDTO.NeedNextSkip
	} else {
		dbStep = database.ToPO[models.SkuTaskStep](stepDTO)
	}
	saveStep, err := skuTaskStepRepository.SaveOrUpdate(dbStep)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SkuTaskStepDTO](saveStep), nil
}

func FindSkuTaskStepByKeyAndResourceIdAndGroupCode(taskId uint64, key string, resourceId uint64, groupCode string) ([]*dto.SkuTaskStepDTO, error) {
	steps, err := skuTaskStepRepository.FindByKeyAndResourceIdAndGroupCode(taskId, key, resourceId, groupCode)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.SkuTaskStepDTO](steps), nil
}

func DeleteSkuTaskStepByKeyAndResourceIdAndGroupCode(taskId uint64, key string, resourceId uint64, groupCode string) error {
	return skuTaskStepRepository.DeleteByKeyAndResourceIdAndGroupCode(taskId, key, resourceId, groupCode)
}

func GetSkuTaskItemStatusCount(taskIDs []uint64) ([]*dto.SkuTaskItemStatusCountDTO, error) {
	var err error
	skuTaskItemRepository := repositories.SkuTaskItemRepository

	var skuTaskItemStatusCounts []*models.SkuTaskItemStatusCount
	if skuTaskItemStatusCounts, err = skuTaskItemRepository.GetStatusCountByTaskIDs(taskIDs); err != nil {
		logger.Errorf("GetSkuTaskItemStatusCount failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	return converter.ToDTOs[dto.SkuTaskItemStatusCountDTO](skuTaskItemStatusCounts), nil
}

func GetSkuTaskItemListByTaskID(taskID uint64) ([]*dto.SkuTaskItemDTO, error) {
	var err error
	skuTaskItemRepository := repositories.SkuTaskItemRepository

	var itemList []*models.SkuTaskItem
	if itemList, err = skuTaskItemRepository.GetItemListByTaskID(taskID); err != nil {
		logger.Errorf("GetSkuTaskItemListByTaskID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	return database.ToDTOs[dto.SkuTaskItemDTO](itemList), nil
}
