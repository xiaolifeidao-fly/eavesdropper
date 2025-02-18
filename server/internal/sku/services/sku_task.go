package services

import (
	"encoding/json"
	"errors"
	"server/common"
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

func UpdateSkuTask(skuTaskUpdateDTO *dto.UpdateSkuTaskDTO) error {
	var err error

	taskID := skuTaskUpdateDTO.ID
	skuTaskDTO, err := getSkuTask(taskID)
	if err != nil {
		return err
	}

	if skuTaskDTO.ID <= 0 {
		return errors.New("任务不存在")
	}

	skuTaskDTO.Status = skuTaskUpdateDTO.Status
	skuTaskDTO.Remark = skuTaskUpdateDTO.Remark
	skuTaskDTO.UpdatedBy = common.GetLoginUserID()

	if _, err = updateSkuTask(skuTaskDTO); err != nil {
		return err
	}

	// 更新任务项
	if err = BatchAddSkuTaskItem(skuTaskUpdateDTO.Items); err != nil {
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

func GetSkuTaskPriceRangeConfigByTaskID(id uint64) (*dto.PriceRangeConfigDTO, error) {
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

	priceRangeConfig := &dto.PriceRangeConfigDTO{}
	if err = json.Unmarshal([]byte(priceRateStr), priceRangeConfig); err != nil {
		return nil, errors.New("价格区间配置转换失败")
	}

	return priceRangeConfig, nil
}
