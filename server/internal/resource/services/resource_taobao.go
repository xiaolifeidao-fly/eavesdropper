package services

import (
	"errors"
	"server/common"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/resource/models"
	"server/internal/resource/repositories"
	"server/internal/resource/services/dto"
)

func CreateResourceTaobao(taobaoDTO *dto.ResourceTaobaoDTO) error {
	var err error
	resourceTaobaoRepository := repositories.ResourceTaobaoRepository

	resourceTaobao := &models.ResourceTaobao{}
	if resourceTaobao, err = resourceTaobaoRepository.FindByResourceId(taobaoDTO.ResourceID); err != nil {
		logger.Errorf("CreateResourceTaobao failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	if resourceTaobao != nil && resourceTaobao.ID != 0 {
		resourceTaobao.UpdatedBy = common.GetLoginUserID()
	} else {
		resourceTaobao = &models.ResourceTaobao{}
		resourceTaobao.ResourceID = taobaoDTO.ResourceID
		resourceTaobao.CreatedBy = common.GetLoginUserID()
		resourceTaobao.UpdatedBy = common.GetLoginUserID()
	}
	resourceTaobao.Nick = taobaoDTO.Nick
	resourceTaobao.UserNumId = taobaoDTO.UserNumId
	resourceTaobao.DisplayNick = taobaoDTO.DisplayNick

	if _, err = resourceTaobaoRepository.SaveOrUpdate(resourceTaobao); err != nil {
		logger.Errorf("CreateResourceTaobao failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	return nil
}

func GetResourceTaobaoByResourceID(resourceID uint64) (*dto.ResourceTaobaoDTO, error) {
	var err error
	resourceTaobaoRepository := repositories.ResourceTaobaoRepository

	resourceTaobao := &models.ResourceTaobao{}
	if resourceTaobao, err = resourceTaobaoRepository.FindByResourceId(resourceID); err != nil {
		logger.Errorf("GetResourceTaobaoByResourceID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	if resourceTaobao == nil {
		return nil, nil
	}
	taobaoDTO := database.ToDTO[dto.ResourceTaobaoDTO](resourceTaobao)
	return taobaoDTO, nil
}
