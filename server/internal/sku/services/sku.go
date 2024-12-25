package services

import (
	"errors"
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
