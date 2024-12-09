package services

import (
	"server/common/encryption"
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
	// TODO 验证密码
	if encryption.Encryption(inputPassword, dbPassword) != dbPassword {
		return nil
	}
	return nil
}
