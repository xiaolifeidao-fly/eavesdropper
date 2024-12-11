package services

import (
	"server/common/encryption"
	"server/internal/auth/common"
	"server/internal/auth/common/constants"
	"server/internal/auth/common/errors"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
)

// CheckUserPassword
// @Description 验证密码
func CheckUserPassword(userID uint64, password string) error {
	var err error
	userPasswordRepository := repositories.NewUserPasswordRepository()

	userPassword := &models.UserPassword{}
	if err = userPasswordRepository.FindByUserID(userID, userPassword); err != nil {
		return err
	}

	if err = checkPassword(password, userPassword.Password); err != nil {
		return err
	}

	return nil
}

// checkPassword
// @Description 验证密码
func checkPassword(inputPassword, dbPassword string) error {
	var err error
	// 解密密码
	if inputPassword, err = encryption.DecryptRSA(inputPassword, common.GetPrivateKey()); err != nil {
		return err
	}

	// 加密密码
	inputPassword = encryptPassword(inputPassword)

	if inputPassword != dbPassword {
		return errors.ErrPasswordIncorrect
	}

	return nil
}

// encryptPassword
// @Description 不可逆加密密码
func encryptPassword(password string) string {
	passwordMd2 := encryption.Md5(encryption.Md5(password))
	encryptedPassword := encryption.Encryption(constants.PasswordSecret, passwordMd2)
	return encryptedPassword
}
