package services

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

var skuFileInfoRepository = database.NewRepository[repositories.SkuFileInfoRepository]()

func GetSkuFileInfo(skuItemId string) ([]*dto.SkuFileInfoDTO, error) {
	skuFileInfos, err := skuFileInfoRepository.FindBySkuItemId(skuItemId)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.SkuFileInfoDTO](skuFileInfos), nil
}

func GetSkuFileDetail(skuItemId string) ([]*dto.SkuFileDetailDTO, error) {
	skuFileInfos, err := skuFileInfoRepository.FindDetailBySkuItemId(skuItemId)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.SkuFileDetailDTO](skuFileInfos), nil
}

func SaveSkuFileInfo(skuFileInfoDTO *dto.SkuFileInfoDTO) (*dto.SkuFileInfoDTO, error) {
	skuFileInfo, err := skuFileInfoRepository.FindBySkuItemIdAndFileId(skuFileInfoDTO.SkuItemId, skuFileInfoDTO.FileId)
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
