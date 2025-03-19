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

var skuTaskStepRepository = database.NewRepository[repositories.SkuTaskStepRepository]()

func SaveSkuTaskStep(stepDTO *dto.SkuTaskStepDTO) (*dto.SkuTaskStepDTO, error) {
	dbStep, err := skuTaskStepRepository.FindByKeyAndResourceIdAndCode(stepDTO.StepKey, stepDTO.ResourceId, stepDTO.Code)
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

func FindSkuTaskStepByKeyAndResourceIdAndGroupCode(key string, resourceId uint64, groupCode string) ([]*dto.SkuTaskStepDTO, error) {
	steps, err := skuTaskStepRepository.FindByKeyAndResourceIdAndGroupCode(key, resourceId, groupCode)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.SkuTaskStepDTO](steps), nil
}

func DeleteSkuTaskStepByKeyAndResourceIdAndGroupCode(key string, resourceId uint64, groupCode string) error {
	return skuTaskStepRepository.DeleteByKeyAndResourceIdAndGroupCode(key, resourceId, groupCode)
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
