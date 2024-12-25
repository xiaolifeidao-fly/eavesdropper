package services

import (
	"errors"
	"server/common/base/page"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

func CreateSku(skuDTO *dto.SkuDTO) (uint64, error) {
	var err error

	if skuDTO, err = saveSku(skuDTO); err != nil {
		return 0, err
	}
	return skuDTO.ID, nil
}

func PageSku(param *dto.SkuPageParamDTO) (*page.Page, error) {
	var err error
	skuRepository := repositories.SkuRepository

	var count = int64(0)
	var pageData = make([]*dto.SkuPageDTO, 0)
	if err = skuRepository.Page(&models.Sku{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage(param.ToPageInfo(count)), nil
	}

	pageDTO := page.BuildPage(param.ToPageInfo(count), pageData)

	return pageDTO, nil
}

func saveSku(skuDTO *dto.SkuDTO) (*dto.SkuDTO, error) {
	var err error
	skuRepository := repositories.SkuRepository

	sku := database.ToPO[models.Sku](skuDTO)
	if sku, err = skuRepository.Create(sku); err != nil {
		logger.Errorf("saveSku failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	skuDTO = database.ToDTO[dto.SkuDTO](sku)
	return skuDTO, nil
}
