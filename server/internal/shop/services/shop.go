package services

import (
	"errors"
	"server/common"
	"server/common/base/page"
	"server/common/middleware/logger"
	"server/internal/shop/models"
	"server/internal/shop/repositories"
	"server/internal/shop/services/dto"
)

func DeleteShop(id uint64) error {
	var err error
	shopRepository := repositories.ShopRepository

	shop := &models.Shop{}
	if shop, err = shopRepository.FindById(id); err != nil {
		logger.Errorf("DeleteShop failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	if shop.ID == 0 {
		return errors.New("店铺不存在")
	}

	shop.Delete()
	shop.UpdatedBy = common.GetLoginUserID()

	if _, err = shopRepository.SaveOrUpdate(shop); err != nil {
		logger.Errorf("DeleteShop failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	return nil
}

func PageShop(param *dto.ShopPageParamDTO) (*page.Page[dto.ShopPageDTO], error) {
	var err error
	shopRepository := repositories.ShopRepository

	count := int64(0)
	var pageData = make([]*dto.ShopPageDTO, 0)
	if err = shopRepository.Page(&models.Shop{}, *param, param.Query, &pageData, &count); err != nil {
		logger.Errorf("PageShop failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.ShopPageDTO](param.ToPageInfo(count)), nil
	}

	pageDTO := page.BuildPage[dto.ShopPageDTO](param.ToPageInfo(count), pageData)
	return pageDTO, nil
}
