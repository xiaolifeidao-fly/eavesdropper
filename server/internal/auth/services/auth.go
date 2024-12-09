package services

import (
	"server/app/auth/common/errors"
	"server/common"
	"server/common/encryption"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

func Login(req *dto.LoginReq, loginUserID *uint64) error {
	var err error
	userRepository := repositories.NewUserRepository()
	userPasswordRepository := repositories.NewUserPasswordRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByUsername(req.Username, dbUser); err != nil {
		return err
	}

	if dbUser.ID == 0 {
		return errors.ErrUserNotFound
	}

	userPassword := &models.UserPassword{}
	if err = userPasswordRepository.FindByUserID(dbUser.ID, userPassword); err != nil {
		return err
	}

	// 验证密码
	if err = checkPassword(req.Password, userPassword.Password); err != nil {
		return errors.ErrAuthPassword
	}

	// 将数据库用户转换为登录用户
	*loginUserID = dbUser.ID

	return nil
}

// GetLoginUser
// @Description 获取登录用户信息
func GetLoginUser(resp *dto.LoginUserResp) error {
	var err error

	loginUserID := common.GetLoginUserID()

	userRepository := repositories.NewUserRepository()
	dbUser := &models.User{}
	if err = userRepository.FindByID(loginUserID, dbUser); err != nil {
		return err
	}

	resp.FromUser(dbUser)

	return nil
}

// checkPassword
// @Description 验证密码
func checkPassword(inputPassword, dbPassword string) error {
	// TODO 验证密码
	if encryption.Encryption(inputPassword, dbPassword) != dbPassword {
		return nil
	}
	return nil
}
