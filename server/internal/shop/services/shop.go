package services

import (
	"encoding/json"
	"errors"
	"server/common"
	"server/common/base"
	"server/common/base/page"
	"server/common/http"
	"server/common/middleware/config"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	timeutil "server/common/time_util"
	resourceServices "server/internal/resource/services"
	"server/internal/shop/models"
	"server/internal/shop/repositories"
	"server/internal/shop/services/dto"
	"strconv"
	"time"
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
	shop, err := getAndValidateShop(id)
	if err != nil {
		return err
	}

	authTokenResult, err := processAndValidateToken(token, shop)
	if err != nil {
		return err
	}

	expireTime, err := calculateNewExpiration(authTokenResult, shop.ResourceID)
	if err != nil {
		return err
	}

	return updateShopAndResource(shop, expireTime)
}

// 获取并验证店铺信息
func getAndValidateShop(id uint64) (*models.Shop, error) {
	shop, err := repositories.ShopRepository.FindById(id)
	if err != nil {
		logger.Errorf("getAndValidateShop failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	if shop.ShopID == 0 {
		return nil, errors.New("请先同步店铺")
	}

	return shop, nil
}

// 处理并验证token
func processAndValidateToken(token string, shop *models.Shop) (*dto.AuthTokenResultDTO, error) {
	authTokenResult, err := processToken(token, shop.Name, shop.ShopID)
	if err != nil {
		return nil, err
	}

	_, err = authTokenResult.ConvertTokenExpireTimeSecond()
	if err != nil {
		return nil, err
	}

	return authTokenResult, nil
}

func processToken(token string, tbShopName string, tbShopId uint64) (*dto.AuthTokenResultDTO, error) {
	tbShopIdStr := strconv.FormatUint(tbShopId, 10)

	requestBody := map[string]interface{}{
		"tbShopName": tbShopName,
		"tbShopId":   tbShopIdStr,
		"token":      token,
	}

	adminUrl := config.GetString("admin_url")
	response, err := http.Post(adminUrl+"/admin_web/orders/token/bind", requestBody, "", map[string]string{})
	if err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		return nil, errors.New("绑定失败")
	}
	logger.Infof("BindShopAuthCode response is %v", response)

	if response["code"] == "1" {
		errMsg := response["message"].(string)
		return nil, errors.New(errMsg)
	}

	data := response["data"].(map[string]any)
	dataStr, _ := json.Marshal(data)

	authTokenResultDTO := &dto.AuthTokenResultDTO{}
	if err = json.Unmarshal(dataStr, authTokenResultDTO); err != nil {
		logger.Errorf("BindShopAuthCode failed, with error is %v", err)
		return nil, errors.New("绑定失败")
	}
	return authTokenResultDTO, nil
}

// 计算新的过期时间
func calculateNewExpiration(authTokenResult *dto.AuthTokenResultDTO, resourceID uint64) (time.Time, error) {
	expireTimeSeconds, err := authTokenResult.ConvertTokenExpireTimeSecond()
	if err != nil {
		return time.Time{}, err
	}

	resource, err := resourceServices.GetResourceByID(resourceID)
	if err != nil {
		return time.Time{}, err
	}

	var currentTime time.Time
	if resource.ExpirationDate == nil {
		currentTime = time.Now()
	} else {
		currentTime = time.Time(*resource.ExpirationDate)
	}

	return timeutil.AddSeconds(currentTime, expireTimeSeconds), nil
}

// 更新店铺和资源信息
func updateShopAndResource(shop *models.Shop, expireTime time.Time) error {
	// 更新店铺状态
	shop.Status = dto.Effective.Value
	if _, err := repositories.ShopRepository.SaveOrUpdate(shop); err != nil {
		logger.Errorf("updateShopAndResource failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	// 更新资源过期时间
	resource, err := resourceServices.GetResourceByID(shop.ResourceID)
	if err != nil {
		return err
	}

	overdueTime := base.TimeNow(expireTime)
	resource.ExpirationDate = &overdueTime

	if _, err := resourceServices.UpdateResource(resource); err != nil {
		return err
	}

	return nil
}
