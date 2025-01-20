package services

import (
	"errors"
	"server/common"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/resource/models"
	"server/internal/resource/repositories"
	"server/internal/resource/services/dto"
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

	if resource.ID == 0 {
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

	pageDTO := page.BuildPage[dto.ResourcePageDTO](param.ToPageInfo(count), pageData)
	return pageDTO, nil
}
