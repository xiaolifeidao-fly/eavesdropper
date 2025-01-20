package services

import (
	"errors"
	"server/common"
	"server/common/base/page"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/converter"
	"server/internal/auth/services/dto"
)

// CreateUser 创建用户
func CreateUser(userAddDTO *dto.UserAddDTO) (*dto.UserDTO, error) {
	var err error

	// 检查用户是否已存在
	var userDTO *dto.UserDTO
	if userDTO, err = getUserByMobile(userAddDTO.Mobile); err != nil {
		return nil, err
	}
	if userDTO.ID > 0 {
		return nil, errors.New("用户已存在")
	}

	// 创建用户
	userDTO = converter.UserAddDTOToUserDTO(userAddDTO)
	if userDTO, err = saveUser(userDTO); err != nil {
		return nil, err
	}

	// 保存用户密码
	userPasswordDTO := converter.ConverterUserPasswordDTO(userDTO.ID, userAddDTO.Password)
	if _, err = CreateUserPassword(userPasswordDTO); err != nil {
		return nil, err
	}

	return userDTO, nil
}

// DeleteUser 删除用户
func DeleteUser(userID uint64) error {
	var err error

	var userDTO *dto.UserDTO
	if userDTO, err = getUserByID(userID); err != nil {
		return err
	}
	if userDTO.ID <= 0 {
		return errors.New("用户不存在")
	}

	userDTO.UpdatedBy = common.GetLoginUserID()
	if err = deleteUser(userDTO); err != nil {
		return err
	}

	return nil
}

// UpdateUser 更新用户
func UpdateUser(userUpdateDTO *dto.UserUpdateDTO) error {
	var err error

	var userDTO *dto.UserDTO
	if userDTO, err = getUserByID(userUpdateDTO.ID); err != nil {
		return err
	}

	userDTO.Nickname = userUpdateDTO.Nickname
	userDTO.UpdatedBy = common.GetLoginUserID()

	if _, err = updateUser(userDTO); err != nil {
		return err
	}

	// 清除缓存
	if err = clearLoginUserCache(userDTO.ID); err != nil {
		return err
	}

	return nil
}

// GetUserByID 根据ID获取用户
func GetUserByID(userID uint64) (*dto.UserDTO, error) {
	return getUserByID(userID)
}

// GetUserByMobile 根据手机号获取用户
func GetUserByMobile(mobile string) (*dto.UserDTO, error) {
	return getUserByMobile(mobile)
}

// GetUserInfo 获取用户信息
func GetUserInfo(userID uint64) (*dto.UserInfoDTO, error) {
	var err error

	var userDTO *dto.UserDTO
	if userDTO, err = getUserByID(userID); err != nil {
		return nil, err
	}

	var userLoginRecordDTO *dto.UserLoginRecordDTO
	if userLoginRecordDTO, err = GetLastUserLoginRecord(userID); err != nil {
		return nil, err
	}

	userInfoDTO := converter.ConverterUserInfoDTO(userDTO)
	userInfoDTO.LastLoginAt = userLoginRecordDTO.LoginTime

	return userInfoDTO, nil
}

// PageUser 分页获取用户
func PageUser(param *dto.UserPageParamDTO) (*page.Page[dto.UserPageDTO], error) {
	var err error
	userRepository := repositories.UserRepository

	var count = int64(0)
	var pageData = make([]*dto.UserPageDTO, 0)
	if err = userRepository.Page(&models.User{}, *param, param.Query, &pageData, &count); err != nil {
		return nil, err
	}

	if count <= 0 {
		return page.BuildEmptyPage[dto.UserPageDTO](param.ToPageInfo(count)), nil
	}

	// 组装用户其他信息
	for _, user := range pageData {
		getUserOtherInfo(user)
	}

	pageDTO := page.BuildPage(param.ToPageInfo(count), pageData)

	return pageDTO, nil
}

func getUserOtherInfo(user *dto.UserPageDTO) {
	userLoginRecordDTO, err := GetLastUserLoginRecord(user.ID)
	if err != nil {
		return
	}
	user.LastLoginAt = userLoginRecordDTO.LoginTime
}

// saveUser 保存用户
func saveUser(userDTO *dto.UserDTO) (*dto.UserDTO, error) {
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

// deleteUser 删除用户
func deleteUser(userDTO *dto.UserDTO) error {
	var err error
	userRepository := repositories.UserRepository

	user := database.ToPO[models.User](userDTO)
	user.Delete()
	if _, err = userRepository.SaveOrUpdate(user); err != nil {
		logger.Errorf("DeleteUser failed, with error is %v", err)
		return errors.New("数据库操作失败")
	}

	return nil
}

// updateUser 更新用户
func updateUser(userDTO *dto.UserDTO) (*dto.UserDTO, error) {
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

// getUserByID 根据ID获取用户
func getUserByID(userID uint64) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	user, err := userRepository.FindById(userID)
	if err != nil {
		return nil, err
	}

	userDTO := database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}

// getUserByMobile 根据手机号获取用户
func getUserByMobile(mobile string) (*dto.UserDTO, error) {
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
