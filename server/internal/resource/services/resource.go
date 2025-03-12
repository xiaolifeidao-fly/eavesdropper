package services

import (
	"errors"
	"server/common"
	"server/common/base"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	timeutil "server/common/time_util"
	"server/internal/resource/models"
	"server/internal/resource/repositories"
	"server/internal/resource/services/dto"
	"time"
)

func CreateResource(req *dto.AddResourceDTO) (uint64, error) {
	var err error

	resourceDTO := &dto.ResourceDTO{}
	converter.Copy(resourceDTO, req)
	resourceDTO.InitCreate()
	if resourceDTO, err = saveResource(resourceDTO); err != nil {
		return 0, err
	}

	return resourceDTO.ID, nil
}

func saveResource(resourceDTO *dto.ResourceDTO) (*dto.ResourceDTO, error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	resource := database.ToPO[models.Resource](resourceDTO)
	if resource, err = resourceRepository.Create(resource); err != nil {
		logger.Errorf("saveResource failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	resourceDTO = database.ToDTO[dto.ResourceDTO](resource)
	return resourceDTO, nil
}

func DeleteResource(id uint64) error {
	var err error
	resourceRepository := repositories.ResourceRepository

	resource := &models.Resource{}
	if resource, err = resourceRepository.FindById(id); err != nil {
		logger.Errorf("DeleteResource failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	if resource.ID == 0 {
		return errors.New("资源不存在")
	}

	resource.Delete()
	resource.UpdatedBy = common.GetLoginUserID()

	if _, err = resourceRepository.SaveOrUpdate(resource); err != nil {
		logger.Errorf("DeleteResource failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	return nil
}

func UpdateResource(resourceDTO *dto.ResourceDTO) (uint64, error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	resource := database.ToPO[models.Resource](resourceDTO)
	if resource, err = resourceRepository.SaveOrUpdate(resource); err != nil {
		logger.Errorf("UpdateResource failed, with error is %v", err)
		return 0, errors.New("数据库操作失败")
	}

	resourceDTO = database.ToDTO[dto.ResourceDTO](resource)
	return resourceDTO.ID, nil
}

func GetResourceByID(id uint64) (*dto.ResourceDTO, error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	resource := &models.Resource{}
	if resource, err = resourceRepository.FindById(id); err != nil {
		logger.Errorf("GetResourceByID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	if resource == nil || resource.ID == 0 {
		return nil, errors.New("资源不存在")
	}

	resourceDTO := database.ToDTO[dto.ResourceDTO](resource)
	return resourceDTO, nil
}

func PageResource(param *dto.ResourcePageParamDTO) (*page.Page[dto.ResourcePageDTO], error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	count := int64(0)
	var pageData = make([]*dto.ResourcePageDTO, 0)
	if err = resourceRepository.Page(&models.Resource{}, *param, param.Query, &pageData, &count); err != nil {
		logger.Errorf("PageResource failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.ResourcePageDTO](param.ToPageInfo(count)), nil
	}

	for _, d := range pageData {
		var nick string
		if d.Source == dto.TaoBao.Value {
			var taobaoDTO *dto.ResourceTaobaoDTO
			if taobaoDTO, err = GetResourceTaobaoByResourceID(d.ID); err != nil {
				logger.Errorf("PageResource failed, with error is %v", err)
				return nil, errors.New("数据库操作失败")
			}
			if taobaoDTO == nil || taobaoDTO.ID == 0 {
				continue
			}
			nick = taobaoDTO.Nick
		}
		d.Nick = nick
	}

	pageDTO := page.BuildPage[dto.ResourcePageDTO](param.ToPageInfo(count), pageData)
	return pageDTO, nil
}

func BindResource(req *dto.ResourceBindDTO) error {
	var err error

	var resourceDTO *dto.ResourceDTO
	if resourceDTO, err = GetResourceByID(req.ID); err != nil {
		return err
	}

	resourceDTO.Account = req.Nick
	// 资源账号有效期,先固定30天
	userID := common.GetLoginUserID()
	expirationDate, _ := GetResourceAuthExpirationDate(userID)
	resourceDTO.ExpirationDate = &expirationDate
	resourceDTO.InitUpdate()
	if _, err = UpdateResource(resourceDTO); err != nil {
		return err
	}

	if resourceDTO.Source == dto.TaoBao.Value {
		taobaoDTO := &dto.ResourceTaobaoDTO{}
		converter.Copy(taobaoDTO, req)
		taobaoDTO.ResourceID = resourceDTO.ID
		if err = CreateResourceTaobao(taobaoDTO); err != nil {
			return err
		}
	}

	return nil
}

func GetResourceByUserID(userID uint64) ([]*dto.ResourceDTO, error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	var resources []*models.Resource
	if resources, err = resourceRepository.GetResourceByUserID(userID); err != nil {
		logger.Errorf("GetResourceByUserID failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	resourcesDTO := database.ToDTOs[dto.ResourceDTO](resources)
	return resourcesDTO, nil
}

func GetResourceByUserIDAndTag(userID uint64, tag string) ([]*dto.ResourceDTO, error) {
	var err error
	resourceRepository := repositories.ResourceRepository

	var resources []*models.Resource
	if resources, err = resourceRepository.GetResourceByUserIDAndTag(userID, tag); err != nil {
		return nil, err
	}

	resourcesDTO := database.ToDTOs[dto.ResourceDTO](resources)
	return resourcesDTO, nil
}

func GetResourceStatus(expirationDate *base.Time) (*dto.ResourceStatusEnum, bool) {
	if expirationDate == nil {
		return nil, false
	}

	nowTime := time.Now()
	isExpiration := !timeutil.IsAfter(expirationDate.ToTime(), nowTime)

	if isExpiration {
		return &dto.EXPIRATION, isExpiration
	}

	return &dto.ONLINE, isExpiration
}
