package services

import (
	"errors"
	"server/common"
	"server/common/base/page"
	"server/common/http"
	"server/common/middleware/database"
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

func GetShopInfos(userID uint64) ([]*dto.ShopDTO, error) {
	var err error
	shopRepository := repositories.ShopRepository

	shops, err := shopRepository.FindByUserID(userID)
	if err != nil {
		logger.Errorf("GetShopInfos failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}
	return database.ToDTOs[dto.ShopDTO](shops), nil
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

func SyncShop(syncDTO *dto.ShopSyncDTO) error {
	var err error

	userID := common.GetLoginUserID()
	var shopDTO *dto.ShopDTO
	if shopDTO, err = GetShopByUserIDAndResourceID(userID, syncDTO.ResourceID); err != nil {
		return err
	}

	if shopDTO == nil || shopDTO.ID == 0 {
		shopDTO = &dto.ShopDTO{}
		shopDTO.UserID = common.GetLoginUserID()
		shopDTO.ResourceID = syncDTO.ResourceID
		shopDTO.InitCreate()
	}
	shopDTO.Name = syncDTO.Name
	shopDTO.ShopID = syncDTO.ShopID
	var shopStatusEnum *dto.ShopStatusEnum
	if shopStatusEnum, err = GetShopStatus(syncDTO.Status); err != nil {
		return err
	}
	shopDTO.Status = shopStatusEnum.Value
	shopDTO.InitUpdate()
	if _, err = updateShop(shopDTO); err != nil {
		return err
	}

	return nil
}

func GetShopByUserIDAndResourceID(userID uint64, resourceID uint64) (*dto.ShopDTO, error) {
	var err error
	shopRepository := repositories.ShopRepository

	shop := &models.Shop{}
	if shop, err = shopRepository.FindByUserIDAndResourceID(userID, resourceID); err != nil {
		logger.Errorf("GetShopByUserIDAndResourceID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	shopDTO := database.ToDTO[dto.ShopDTO](shop)
	return shopDTO, nil
}

func GetShopByID(id uint64) (*dto.ShopDTO, error) {
	var err error
	shopRepository := repositories.ShopRepository

	shop := &models.Shop{}
	if shop, err = shopRepository.FindById(id); err != nil {
		logger.Errorf("GetShopByID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	shopDTO := database.ToDTO[dto.ShopDTO](shop)
	return shopDTO, nil
}

func updateShop(shopDTO *dto.ShopDTO) (*dto.ShopDTO, error) {
	var err error
	shopRepository := repositories.ShopRepository

	shop := database.ToPO[models.Shop](shopDTO)
	if shop, err = shopRepository.SaveOrUpdate(shop); err != nil {
		logger.Errorf("updateShop failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	shopDTO = database.ToDTO[dto.ShopDTO](shop)
	return shopDTO, nil
}

func GetShopByResourceID(resourceID uint64) (*dto.ShopDTO, error) {
	var err error
	shopRepository := repositories.ShopRepository

	shop := &models.Shop{}
	if shop, err = shopRepository.FindByResourceID(resourceID); err != nil {
		logger.Errorf("GetShopByID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	shopDTO := database.ToDTO[dto.ShopDTO](shop)
	return shopDTO, nil
}

func GetShopStatus(status string) (*dto.ShopStatusEnum, error) {
	switch status {
	case dto.Effective.Value:
		return &dto.Effective, nil
	case dto.LoseEfficacy.Value:
		return &dto.LoseEfficacy, nil
	default:
		return nil, errors.New("获取店铺状态失败")
	}
}

func BindShopAuthCode(id uint64, token string) error {
	var err error
	shopRepository := repositories.ShopRepository

	shop := &models.Shop{}
	if shop, err = shopRepository.FindById(id); err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	if shop.ShopID == 0 {
		return errors.New("请先同步店铺")
	}

	if err = processToken(token, shop.Name, shop.ShopID); err != nil {
		return err
	}

	return nil
}

func processToken(token string, tbShopName string, tbShopId uint64) error {
	requestBody := map[string]interface{}{
		"tbShopName": tbShopName,
		"tbShopId":   tbShopId,
		"token":      token,
	}

	response, err := http.Post("http://8.152.204.115:8009/admin_web/orders/token/bind", requestBody, "", map[string]string{})
	if err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		return errors.New("绑定失败")
	}
	logger.Infof("BindShopAuthCode response is %v", response)

	if response["code"] == "1" {
		errMsg := response["message"].(string)
		return errors.New(errMsg)
	}

	return nil
}
