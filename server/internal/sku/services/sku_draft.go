package services

import (
	"server/common/middleware/database"
	"server/internal/sku/models"
	"server/internal/sku/repositories"
	"server/internal/sku/services/dto"
)

var skuDraftRepository = database.NewRepository[repositories.SkuDraftRepository]()

func GetSkuDraftBySkuItemId(resourceId int64, skuItemId string) (*dto.SkuDraftDto, error) {
	skuFileInfo, err := skuDraftRepository.GetSkuDraft(resourceId, skuItemId)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SkuDraftDto](skuFileInfo), nil
}

func ActiveSkuDraft(skuDraftDto *dto.SkuDraftDto) (*dto.SkuDraftDto, error) {
	dbSkuFileInfo, err := skuDraftRepository.GetSkuDraft(skuDraftDto.ResourceId, skuDraftDto.SkuItemID)
	if err != nil {
		return nil, err
	}
	if dbSkuFileInfo != nil {
		dbSkuFileInfo.SkuDraftId = skuDraftDto.SkuDraftId
	} else {
		dbSkuFileInfo = database.ToPO[models.SkuDraft](skuDraftDto)
	}
	dbSkuFileInfo.Status = dto.DRAFT_ACTIVE
	skuDraftRepository.SaveOrUpdate(dbSkuFileInfo)
	return database.ToDTO[dto.SkuDraftDto](dbSkuFileInfo), nil
}

func ExpireSkuDraft(resourceId int64, skuItemId string) (bool, error) {
	dbSkuFileInfo, err := skuDraftRepository.GetSkuDraft(resourceId, skuItemId)
	if err != nil {
		return false, err
	}
	dbSkuFileInfo.Status = dto.DRAFT_EXPIRED
	skuDraftRepository.SaveOrUpdate(dbSkuFileInfo)
	return true, nil
}
