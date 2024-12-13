package services

import (
	"errors"
	"server/common/logger"
	"server/common/middleware/database"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

// CreateUserLoginRecord
// @Description 创建用户登录记录
func CreateUserLoginRecord(userLoginRecordDTO *dto.UserLoginRecordDTO) (*dto.UserLoginRecordDTO, error) {
	var err error
	userLoginRecordRepository := repositories.UserLoginRecordRepository

	userLoginRecord := database.ToPO[models.UserLoginRecord](userLoginRecordDTO)
	if _, err = userLoginRecordRepository.Create(userLoginRecord); err != nil {
		logger.Errorf("CreateUserLoginRecord failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	userLoginRecordDTO = database.ToDTO[dto.UserLoginRecordDTO](userLoginRecord)
	return userLoginRecordDTO, nil
}

// GetLastUserLoginRecord
// @Description 获取用户最后一次登录记录
func GetLastUserLoginRecord(userID uint64) (*dto.UserLoginRecordDTO, error) {
	var err error
	userLoginRecordRepository := repositories.UserLoginRecordRepository

	userLoginRecord, err := userLoginRecordRepository.FindLastByUserID(userID)
	if err != nil {
		logger.Errorf("GetLastUserLoginRecord failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	return database.ToDTO[dto.UserLoginRecordDTO](userLoginRecord), nil
}
