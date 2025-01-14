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

const (
	SKU_SUCCESS = "success" // 发布成功
	SKU_PENDING = "pending" // 发布中
	SKU_ERROR   = "error"   // 发布失败
)

func CreateSku(skuDTO *dto.SkuDTO) (uint64, error) {
	var err error

	var skuDTO2 *dto.SkuDTO
	if skuDTO2, err = GetSkuByPublishResourceIdAndSourceSkuId(skuDTO.PublishResourceID, skuDTO.SourceSkuID); err != nil {
		return 0, err
	}
	if skuDTO2 != nil && skuDTO2.ID > 0 {
		if skuDTO2.Status == SKU_SUCCESS {
			return 0, errors.New("商品已存在")
		}
	}

	if skuDTO, err = saveSku(skuDTO); err != nil {
		return 0, err
	}
	return skuDTO.ID, nil
}

func GetSkuByPublishResourceIdAndSourceSkuId(publishResourceId uint64, sourceSkuId string) (*dto.SkuDTO, error) {
	var err error
	skuRepository := repositories.SkuRepository

	sku, err := skuRepository.GetSkuByPublishResourceIdAndSourceSkuId(publishResourceId, sourceSkuId)
	if err != nil {
		return nil, err
	}

	if sku == nil {
		return nil, nil
	}
	return database.ToDTO[dto.SkuDTO](sku), nil
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
