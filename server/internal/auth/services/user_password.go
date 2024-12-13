package services

import (
	"errors"

	"server/common/encryption"
	"server/common/logger"
	"server/common/middleware/database"
	authCommon "server/internal/auth/common"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

const (
	PasswordSecret    = "dwnqY8"                           // 加密密码密钥
	OriPasswordSecret = "oerlis32baeeslkmnehssphrase12341" // 原始密码密钥
)

// CreateUserPassword 创建用户密码
func CreateUserPassword(userPasswordDTO *dto.UserPasswordDTO) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword := database.ToPO[models.UserPassword](userPasswordDTO)
	if _, err = userPasswordRepository.Create(userPassword); err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO = database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

// UpdateUserPassword 更新用户密码
func UpdateUserPassword(userPasswordDTO *dto.UserPasswordDTO) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword := database.ToPO[models.UserPassword](userPasswordDTO)
	if userPassword, err = userPasswordRepository.SaveOrUpdate(userPassword); err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO = database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

// GetUserPasswordByUserID 根据用户ID获取用户密码
func GetUserPasswordByUserID(userID uint64) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword, err := userPasswordRepository.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO := database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

func EncryptPassword(inputPassword string) (string, string, error) {
	var err error
	encryptPassword, err := encryptPassword(inputPassword)
	if err != nil {
		return "", "", err
	}

	encryptOriPassword, err := encryptOriPassword(inputPassword)
	if err != nil {
		return "", "", err
	}

	return encryptPassword, encryptOriPassword, nil
}

// encryptPassword
// @Description 不可逆加密密码
func encryptPassword(inputPassword string) (string, error) {
	var err error

	// 解密密码
	if inputPassword, err = encryption.DecryptRSA(inputPassword, authCommon.GetPrivateKey()); err != nil {
		logger.Errorf("EncryptPassword failed, with error is %v", err)
		return "", errors.New("系统错误")
	}

	passwordMd2 := encryption.Md5(encryption.Md5(inputPassword))
	encryptedPassword := encryption.Encryption(PasswordSecret, passwordMd2)
	return encryptedPassword, nil
}

// encryptOriPassword
// @Description 加密原始密码
func encryptOriPassword(inputPassword string) (string, error) {
	var err error

	if inputPassword, err = encryption.DecryptRSA(inputPassword, authCommon.GetPrivateKey()); err != nil {
		logger.Errorf("encryptOriPassword failed, with error is %v", err)
		return "", errors.New("系统错误")
	}

	secret := []byte(OriPasswordSecret)
	encrypted, err := encryption.EncryptAES([]byte(inputPassword), secret)
	if err != nil {
		return "", err
	}
	return encrypted, nil
}

// decryptOriPassword
// @Description 解密原始密码
func decryptOriPassword(password string) (string, error) {
	var err error

	secret := []byte(OriPasswordSecret)
	decryptedPassword, err := encryption.DecryptAES(password, secret)
	if err != nil {
		logger.Errorf("decryptOriPassword failed, with error is %v", err)
		return "", errors.New("系统错误")
	}
	return string(decryptedPassword), nil
}
