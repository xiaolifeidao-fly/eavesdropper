package services

import (
	"server/app/auth/common/errors"
	"server/common"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

// AddUser
// @Description 添加用户
func AddUser(req *dto.UserAddReq, id *uint64) error {
	var err error
	userRepository := repositories.NewUserRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByUsername(req.Username, dbUser); err != nil {
		return err
	}

	// 用户已存在
	if dbUser.ID > 0 {
		return errors.ErrUserExists
	}

	req.ToUser(dbUser)
	if err = userRepository.Create(dbUser); err != nil {
		return err
	}

	*id = dbUser.ID
	return nil
}

// DeleteUser
// @Description 删除用户
func DeleteUser(req *dto.UserDeleteReq) error {
	var err error
	userRepository := repositories.NewUserRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByID(req.ID, dbUser); err != nil {
		return err
	}

	if dbUser.ID == 0 {
		return errors.ErrUserNotFound
	}

	req.ToUser(dbUser)
	if err = userRepository.Delete(dbUser); err != nil {
		return err
	}

	return nil
}

// UpdateUser
// @Description 更新用户
func UpdateUser(req *dto.UserUpdateReq) error {
	var err error
	userRepository := repositories.NewUserRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByID(req.ID, dbUser); err != nil {
		return err
	}

	if dbUser.ID == 0 {
		return errors.ErrUserNotFound
	}

	loginUserId := common.GetLoginUserID()
	req.ToUser(dbUser, loginUserId)
	if err = userRepository.Update(dbUser); err != nil {
		return err
	}

	return nil
}

// GetUser
// @Description 获取用户
func GetUser(req *dto.UserGetReq, resp *dto.UserGetResp) error {
	var err error
	userRepository := repositories.NewUserRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByID(req.ID, dbUser); err != nil {
		return err
	}

	if dbUser.ID == 0 {
		return errors.ErrUserNotFound
	}

	resp.FromUser(dbUser)

	return nil
}

// PageUser
// @Description 分页获取用户
func PageUser(req *dto.UserPageReq, list *[]*dto.UserPageResp, count *int64) error {
	var err error
	userRepository := repositories.NewUserRepository()
	userLoginRecordRepository := repositories.NewUserLoginRecordRepository()

	if err = userRepository.Page(&models.User{}, *req, req.Page, list, count); err != nil {
		return err
	}

	for _, user := range *list {
		record := &models.UserLoginRecord{}
		if err = userLoginRecordRepository.FindLastByUserID(uint64(user.ID), record); err != nil {
			return err
		}
		user.LastLoginAt = record.LoginTime
	}

	return nil
}

// GetUserList
// @Description 获取用户列表
func GetUserList(req *dto.UserGetListReq, list *[]dto.UserGetListResp) error {
	var err error
	userRepository := repositories.NewUserRepository()

	if err = userRepository.FindAllByCondition(&models.User{}, *req, list); err != nil {
		return err
	}

	return nil
}
