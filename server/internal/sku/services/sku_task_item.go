package services

import (
	"errors"
	"fmt"
	"server/common"
	"server/common/base"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/middleware/storage/oss"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
	"strconv"
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
var skuTaskStepLogRepository = database.NewRepository[repositories.SkuTaskStepLogRepository]()

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

func SaveSkuTaskStepLog(stepLogDTO *dto.SkuTaskStepLogDTO) (*dto.SkuTaskStepLogDTO, error) {
	stepLog := database.ToPO[models.SkuTaskStepLog](stepLogDTO)
	if stepLogDTO.Content != "" {
		path, err := storeJsonData(stepLogDTO)
		logger.Infof("SaveSkuTaskStepLog, with path is %s", path)
		if err != nil {
			return nil, err
		}
		stepLog.LogPath = path
	}
	dbStepLog, err := skuTaskStepLogRepository.GetBySkuTaskStepId(stepLog.SkuTaskStepId)
	if err != nil {
		return nil, err
	}
	if dbStepLog != nil {
		dbStepLog.LogPath = stepLog.LogPath
	} else {
		dbStepLog = stepLog
	}
	saveStepLog, err := skuTaskStepLogRepository.SaveOrUpdate(dbStepLog)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SkuTaskStepLogDTO](saveStepLog), nil
}

func GetSkuTaskStepLogListBySkuTaskStepId(skuTaskStepId uint64) (*dto.SkuTaskStepLogDTO, error) {
	stepLog, err := skuTaskStepLogRepository.GetBySkuTaskStepId(skuTaskStepId)
	if err != nil {
		return nil, err
	}
	stepLogDTO := database.ToDTO[dto.SkuTaskStepLogDTO](stepLog)
	if stepLog.LogPath != "" {
		jsonData, err := convertToJsonData(stepLog.LogPath)
		if err != nil {
			return nil, err
		}
		stepLogDTO.Content = jsonData
	}
	return stepLogDTO, nil
}

func convertToJsonData(path string) (string, error) {
	bytes, err := oss.Get(path)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func getPath(skuTaskStepId uint64) string {
	now := base.Now()
	// 20250519 这样的格式
	nowStr := now.ToTime().Format("20060102")
	skuTaskStepIdStr := strconv.FormatUint(skuTaskStepId, 10)
	return fmt.Sprintf("client/log/%s/%s.log", nowStr, skuTaskStepIdStr)

}

func storeJsonData(stepLogDTO *dto.SkuTaskStepLogDTO) (string, error) {
	path := getPath(stepLogDTO.SkuTaskStepId)
	return path, oss.Put(path, []byte(stepLogDTO.Content))
}
