package services

import (
	"errors"
	"fmt"
	"server/common/base/page"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"

	resourceService "server/internal/resource/services"
)

const (
	SKU_SUCCESS = "success" // 发布成功
	SKU_PENDING = "pending" // 发布中
	SKU_ERROR   = "error"   // 发布失败
)

var skuMapperRepository = database.NewRepository[repositories.SkuMapperRepository]()

func CreateSku(skuDTO *dto.SkuDTO) (uint64, error) {
	var err error

	var skuDTO2 *dto.SkuDTO
	if skuDTO2, err = GetSkuByPublishResourceIdAndSourceSkuIdAndSource(skuDTO.PublishResourceID, skuDTO.SourceSkuID, skuDTO.Source); err != nil {
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

func GetSkuByPublishResourceIdAndSourceSkuIdAndSource(publishResourceId uint64, sourceSkuId, source string) (*dto.SkuDTO, error) {
	var err error
	skuRepository := repositories.SkuRepository

	sku, err := skuRepository.GetSkuByPublishResourceIdAndSourceSkuIdAndSource(publishResourceId, sourceSkuId, source)
	if err != nil {
		return nil, err
	}

	if sku == nil || sku.DeletedAt.Valid {
		return nil, nil
	}
	return database.ToDTO[dto.SkuDTO](sku), nil
}

func PageSku(param *dto.SkuPageParamDTO, userID uint64) (*page.Page[dto.SkuPageDTO], error) {
	var err error
	skuRepository := repositories.SkuRepository
	param.UserId = userID
	var count = int64(0)
	var pageData = make([]*dto.SkuPageDTO, 0)
	if err = skuRepository.Page(&models.Sku{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.SkuPageDTO](param.ToPageInfo(count)), nil
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

func GetSkuSourceUrl(source string, publishSkuId string) string {
	publishUrl := resourceService.GetResourceSkuUrl(source)
	return fmt.Sprintf(publishUrl, publishSkuId)
}

func CreateSkuMapper(skuMapperDTO *dto.SkuMapperDto) (*dto.SkuMapperDto, error) {
	skuMapper, err := skuMapperRepository.FindBySkuIdAndTbSkuSaleInfo(skuMapperDTO.SkuId, skuMapperDTO.TbSkuSaleInfo)
	if err != nil {
		return nil, err
	}

	if skuMapper != nil {
		skuMapper.PxxSkuSaleInfo = skuMapperDTO.PxxSkuSaleInfo
	} else {
		skuMapper = database.ToPO[models.SkuMapper](skuMapperDTO)
	}

	skuMapper, err = skuMapperRepository.SaveOrUpdate(skuMapper)
	if err != nil {
		return nil, err
	}

	return database.ToDTO[dto.SkuMapperDto](skuMapper), nil
}

func GetSkuByPublishResourceIdAndPublishSkuId(publishResourceId uint64, publishSkuId string, status string) (*dto.SkuDTO, error) {
	skuRepository := repositories.SkuRepository

	sku, err := skuRepository.GetSkuByPublishResourceIdAndPublishSkuIdAndStatus(publishResourceId, publishSkuId, status)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SkuDTO](sku), nil
}

func GetSkuByID(id uint64) (*dto.SkuDTO, error) {
	var err error
	skuRepository := repositories.SkuRepository

	var sku *models.Sku
	if sku, err = skuRepository.GetByID(id); err != nil {
		logger.Errorf("GetSkuByID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	return database.ToDTO[dto.SkuDTO](sku), nil
}
