package services

import (
	"errors"
	"server/common/converter"
	"server/common/logger"
	"server/common/middleware/database"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

func GetUserInfo(userID uint64) (*dto.UserInfoDTO, error) {
	userDTO, err := GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	userInfoDTO := dto.UserInfoDTO{}
	converter.Copy(&userInfoDTO, &userDTO)

	return &userInfoDTO, nil
}

// CreateUser 创建用户
func CreateUser(userDTO *dto.UserDTO) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	user := database.ToPO[models.User](userDTO)
	if user, err = userRepository.Create(user); err != nil {
		logger.Errorf("CreateUser failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	userDTO = database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}

// UpdateUser 更新用户
func UpdateUser(userDTO *dto.UserDTO) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	user := database.ToPO[models.User](userDTO)
	if user, err = userRepository.SaveOrUpdate(user); err != nil {
		logger.Errorf("UpdateUser failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	userDTO = database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}

// GetUserByID 根据ID获取用户
func GetUserByID(userID uint64) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	user, err := userRepository.FindById(userID)
	if err != nil {
		return nil, err
	}

	userDTO := database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}

// GetUserByMobile 根据手机号获取用户
func GetUserByMobile(mobile string) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	user, err := userRepository.FindByMobile(mobile)
	if err != nil {
		logger.Errorf("GetUserByMobile failed, with error is %v", err)
		return nil, errors.New("数据库操作失败")
	}

	userDTO := database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}
