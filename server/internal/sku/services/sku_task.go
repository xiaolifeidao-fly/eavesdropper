package services

import (
	"encoding/json"
	"errors"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

func CreateSkuTask(addSkuTaskDTO *dto.AddSkuTaskDTO) (*dto.SkuTaskDTO, error) {
	var err error

	skuTaskDTO := converter.ToDTO[dto.SkuTaskDTO](addSkuTaskDTO)
	if skuTaskDTO, err = saveSkuTask(skuTaskDTO); err != nil {
		return nil, err
	}

	for _, item := range addSkuTaskDTO.Items {
		item.TaskId = skuTaskDTO.ID
	}

	var taskItems []*dto.SkuTaskItemDTO
	if taskItems, err = BatchAddSkuTaskItem(addSkuTaskDTO.Items); err != nil {
		return nil, err
	}
	skuTaskDTO.Items = taskItems
	return skuTaskDTO, nil
}

func UpdateSkuTask(skuTaskUpdateDTO *dto.UpdateSkuTaskDTO) (*dto.SkuTaskDTO, error) {
	var err error

	taskID := skuTaskUpdateDTO.ID
	skuTaskDTO, err := getSkuTask(taskID)
	if err != nil {
		return nil, err
	}

	if skuTaskDTO.ID <= 0 {
		return nil, errors.New("任务不存在")
	}

	skuTaskDTO.Status = skuTaskUpdateDTO.Status
	skuTaskDTO.Remark = skuTaskUpdateDTO.Remark
	skuTaskDTO.UpdatedBy = common.GetLoginUserID()

	if _, err = updateSkuTask(skuTaskDTO); err != nil {
		return nil, err
	}

	for _, item := range skuTaskUpdateDTO.Items {
		item.Source = skuTaskDTO.Source
	}

	// 更新任务项
	var taskItems []*dto.SkuTaskItemDTO
	if taskItems, err = BatchAddSkuTaskItem(skuTaskUpdateDTO.Items); err != nil {
		return nil, err
	}
	skuTaskDTO.Items = taskItems
	return skuTaskDTO, nil
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

func getSkuTask(id uint64) (*dto.SkuTaskDTO, error) {
	var err error
	skuRepository := repositories.SkuTaskRepository

	skuTask, err := skuRepository.FindById(id)
	if err != nil {
		return nil, err
	}

	skuTaskDTO := database.ToDTO[dto.SkuTaskDTO](skuTask)
	return skuTaskDTO, nil
}

func GetSkuTaskPriceRangeConfigByTaskID(id uint64) ([]*dto.PriceRangeConfigDTO, error) {
	var err error
	skuRepository := repositories.SkuTaskRepository

	skuTask, err := skuRepository.FindById(id)
	if err != nil {
		return nil, err
	}

	if skuTask == nil || skuTask.ID <= 0 {
		return nil, errors.New("任务不存在")
	}

	priceRateStr := skuTask.PriceRate
	if priceRateStr == "" {
		return nil, nil
	}

	priceRangeConfigs := make([]*dto.PriceRangeConfigDTO, 0)
	if err = json.Unmarshal([]byte(priceRateStr), &priceRangeConfigs); err != nil {
		return nil, errors.New("价格区间配置转换失败")
	}

	return priceRangeConfigs, nil
}

func PageSkuTask(param *dto.SkuTaskPageParamDTO) (*page.Page[dto.SkuTaskPageDTO], error) {
	var err error
	skuTaskRepository := repositories.SkuTaskRepository

	var count int64
	var pageData = make([]*dto.SkuTaskPageDTO, 0)
	if err = skuTaskRepository.Page(&models.SkuTask{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.SkuTaskPageDTO](param.ToPageInfo(count)), nil
	}

	fillSkuTaskPageStatistics(pageData)
	pageDTO := page.BuildPage(param.ToPageInfo(count), pageData)

	return pageDTO, nil
}

func fillSkuTaskPageStatistics(skuTaskPageDTOs []*dto.SkuTaskPageDTO) error {
	var err error
	taskIDs := make([]uint64, 0)
	skuTaskPageDTOMap := make(map[uint64]*dto.SkuTaskPageDTO)
	for _, skuTaskPageDTO := range skuTaskPageDTOs {
		taskID := skuTaskPageDTO.ID
		taskIDs = append(taskIDs, taskID)
		skuTaskPageDTOMap[taskID] = skuTaskPageDTO
	}
	var itemStatusCounts []*dto.SkuTaskItemStatusCountDTO
	if itemStatusCounts, err = GetSkuTaskItemStatusCount(taskIDs); err != nil {
		return err
	}

	for _, itemStatusCount := range itemStatusCounts {
		taskID := itemStatusCount.TaskID
		if skuTaskPageDTO, ok := skuTaskPageDTOMap[taskID]; ok {
			itemStatus := itemStatusCount.Status
			switch itemStatus {
			case dto.SkuTaskItemStatusSuccess.Value:
				skuTaskPageDTO.SuccessCount += itemStatusCount.Count
			case dto.SkuTaskItemStatusFailed.Value:
				skuTaskPageDTO.FailedCount += itemStatusCount.Count
			case dto.SkuTaskItemStatusCancel.Value:
				skuTaskPageDTO.CancelCount += itemStatusCount.Count
			case dto.SkuTaskItemStatusExistence.Value:
				skuTaskPageDTO.ExistenceCount += itemStatusCount.Count
			}
		}
	}
	return nil
}
