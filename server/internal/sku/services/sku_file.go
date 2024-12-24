package services

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
	"server/internal/sku/repository"
	"server/internal/sku/services/dto"
)

var skuFileInfoRepository = repository.SkuFileInfoRepository{}

func GetSkuFileInfo(skuId uint64) ([]*dto.SkuFileInfoDTO, error) {
	skuFileInfos, err := skuFileInfoRepository.FindBySkuId(skuId)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.SkuFileInfoDTO](skuFileInfos), nil
}

func SaveSkuFileInfo(skuFileInfoDTO *dto.SkuFileInfoDTO) (*dto.SkuFileInfoDTO, error) {
	skuFileInfo, err := skuFileInfoRepository.FindBySkuIdAndFileId(skuFileInfoDTO.SkuId, skuFileInfoDTO.FileId)
	if err != nil {
		return nil, err
	}
	if skuFileInfo != nil {
		return database.ToDTO[dto.SkuFileInfoDTO](skuFileInfo), nil
	}
	skuFileInfoPO := database.ToPO[models.SkuFileInfo](skuFileInfoDTO)
	saveSkuFileInfo, err := skuFileInfoRepository.SaveOrUpdate(skuFileInfoPO)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SkuFileInfoDTO](saveSkuFileInfo), nil
}
