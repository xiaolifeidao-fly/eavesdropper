package services

import (
	"errors"
	"server/common/converter"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/category/models"
	"server/internal/category/repositories"
	"server/internal/category/services/dto"
)

func CreateCategory(categoryDTO *dto.CategoryDTO) (uint64, error) {
	var err error

	var categoryDTO2 *dto.CategoryDTO
	if categoryDTO2, err = GetCategoryByTbID(categoryDTO.TbId); err != nil {
		return 0, err
	}

	if categoryDTO2 != nil && categoryDTO2.ID != 0 {
		return categoryDTO2.ID, nil
	}

	if categoryDTO, err = saveCategory(categoryDTO); err != nil {
		return 0, err
	}
	return categoryDTO.ID, nil
}

func BatchCreateCategory(categorDTOs []*dto.CategoryDTO) error {
	var err error

	if categorDTOs, err = removeExistingCategory(categorDTOs); err != nil {
		return err
	}

	if categorDTOs == nil || len(categorDTOs) == 0 {
		return nil
	}

	categoryRepository := repositories.CategoryRepositories
	categories := database.ToPOs[models.Category](categorDTOs)
	if _, err = categoryRepository.BatchCreate(categories); err != nil {
		logger.Errorf("BatchCreateCategory failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}
	return nil
}

func GetCategoryByTbID(tbID uint64) (*dto.CategoryDTO, error) {
	var err error
	categoryRepository := repositories.CategoryRepositories

	var cacategory *models.Category
	if cacategory, err = categoryRepository.FindByTbID(tbID); err != nil {
		logger.Errorf("GetCategoryByTbID failed, with error is %v", err)
		return nil, errors.New("数据操作失败")
	}
	return converter.ToDTO[dto.CategoryDTO](cacategory), nil
}

func saveCategory(categoryDTO *dto.CategoryDTO) (*dto.CategoryDTO, error) {
	var err error
	categoryRepository := repositories.CategoryRepositories

	category := database.ToPO[models.Category](categoryDTO)
	if category, err = categoryRepository.Create(category); err != nil {
		logger.Errorf("saveCategory failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	categoryDTO = database.ToDTO[dto.CategoryDTO](category)
	return categoryDTO, nil
}

func removeExistingCategory(categorDTOs []*dto.CategoryDTO) ([]*dto.CategoryDTO, error) {
	var err error

	tbIDs := make([]uint64, 0)
	for _, categorDTO := range categorDTOs {
		tbIDs = append(tbIDs, categorDTO.TbId)
	}

	categoryRepository := repositories.CategoryRepositories
	var categories []*models.Category
	if categories, err = categoryRepository.FindByTbIDs(tbIDs); err != nil {
		logger.Errorf("removeExistingCategory failed, with error is %v", err)
		return nil, errors.New("数据操作失败")
	}

	categoryMap := make(map[uint64]*models.Category)
	for _, category := range categories {
		categoryMap[category.TbId] = category
	}

	newCacategoryDTOs := make([]*dto.CategoryDTO, 0)
	for _, category := range categorDTOs {
		if _, ok := categoryMap[category.TbId]; ok {
			continue
		}
		newCacategoryDTOs = append(newCacategoryDTOs, category)
	}
	return newCacategoryDTOs, nil
}
