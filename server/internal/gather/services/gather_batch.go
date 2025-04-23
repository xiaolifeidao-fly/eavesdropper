package services

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"server/common/base/page"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/gather/models"
	"server/internal/gather/repositories"
	"server/internal/gather/services/dto"
)

func AddGatherBatch(addDto *dto.GatherBatchDTO) (*dto.GatherBatchDTO, error) {
	var err error
	gatherRepository := repositories.GatherBatchRepository

	gatherBatch := database.ToPO[models.GatherBatch](addDto)
	if _, err = gatherRepository.Create(gatherBatch); err != nil {
		logger.Errorf("AddGatherBatch failed, with error is %v", err)
		return nil, errors.New("操作数据库错误")
	}

	addDto = database.ToDTO[dto.GatherBatchDTO](gatherBatch)
	return addDto, nil
}

func GetGatherBatchNo(userId uint64, source string) (string, error) {
	var err error
	gatherRepository := repositories.GatherBatchRepository

	count, err := gatherRepository.GetTodayGatherBatchNoCount(userId, source)
	if err != nil {
		logger.Errorf("GetGatherBatchNo failed, with error is %v", err)
		return "", errors.New("数据库错误")
	}

	// count 部分补齐3位
	countStr := strconv.FormatInt(count+1, 10)
	if len(countStr) < 3 {
		countStr = strings.Repeat("0", 3-len(countStr)) + countStr
	}

	return source + "-" + time.Now().Format("20060102") + "-" + countStr, nil
}

func PageGatherBatch(param *dto.GatherBatchPageParamDTO) (*page.Page[dto.GatherBatchPageDTO], error) {
	var err error
	gatherRepository := repositories.GatherBatchRepository

	var count int64
	var pageData = make([]*dto.GatherBatchPageDTO, 0)
	if err = gatherRepository.Page(&models.GatherBatch{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.GatherBatchPageDTO](param.ToPageInfo(count)), nil
	}

	pageDTO := page.BuildPage(param.ToPageInfo(count), pageData)

	return pageDTO, nil
}
