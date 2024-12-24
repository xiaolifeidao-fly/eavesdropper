package services

import (
	"errors"

	"server/common/encryption"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	authCommon "server/internal/auth/common"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

const (
	PasswordSecret    = "dwnqY8"                           // 加密密码密钥
	OriPasswordSecret = "oerlis32baeeslkmnehssphrase12341" // 原始密码密钥
)

func CreateUserPassword(userPasswordDTO *dto.UserPasswordDTO) (*dto.UserPasswordDTO, error) {
	var err error

	password := userPasswordDTO.Password

	// 解密密码
	if password, err = encryption.DecryptRSA(password, authCommon.GetPrivateKey()); err != nil {
		logger.Errorf("DecryptRSA failed, with error is %v", err)
		return nil, errors.New("系统错误")
	}

	encryptPassword := encryptPassword(password)            // 不可逆加密密码
	encryptOriPassword, err := encryptOriPassword(password) // 加密原始密码
	if err != nil {
		return nil, err
	}

	userPasswordDTO.Password = encryptPassword
	userPasswordDTO.OriPassword = encryptOriPassword
	if userPasswordDTO, err = saveUserPassword(userPasswordDTO); err != nil {
		return nil, err
	}

	return userPasswordDTO, nil
}

// saveUserPassword 保存用户密码
func saveUserPassword(userPasswordDTO *dto.UserPasswordDTO) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword := database.ToPO[models.UserPassword](userPasswordDTO)
	if userPassword, err = userPasswordRepository.SaveOrUpdate(userPassword); err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO = database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

// updateUserPassword 更新用户密码
func updateUserPassword(userPasswordDTO *dto.UserPasswordDTO) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword := database.ToPO[models.UserPassword](userPasswordDTO)
	if userPassword, err = userPasswordRepository.SaveOrUpdate(userPassword); err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO = database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

// getUserPasswordByUserID 根据用户ID获取用户密码
func getUserPasswordByUserID(userID uint64) (*dto.UserPasswordDTO, error) {
	var err error
	userPasswordRepository := repositories.UserPasswordRepository

	userPassword, err := userPasswordRepository.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("数据库操作失败")
	}

	userPasswordDTO := database.ToDTO[dto.UserPasswordDTO](userPassword)
	return userPasswordDTO, nil
}

// checkPassword
// @Description 验证密码
func checkPassword(inputPassword, dbPassword string) error {
	var err error

	// 解密密码
	if inputPassword, err = encryption.DecryptRSA(inputPassword, authCommon.GetPrivateKey()); err != nil {
		logger.Errorf("DecryptRSA failed, with error is %v", err)
		return errors.New("系统错误")
	}

	// 加密密码
	encryptedPassword := encryptPassword(inputPassword)

	if encryptedPassword != dbPassword {
		return errors.New("密码错误")
	}

	return nil
}

// encryptPassword
// @Description 不可逆加密密码
func encryptPassword(inputPassword string) string {
	passwordMd2 := encryption.Md5(encryption.Md5(inputPassword))
	encryptedPassword := encryption.Encryption(PasswordSecret, passwordMd2)
	return encryptedPassword
}

// encryptOriPassword
// @Description 加密原始密码
func encryptOriPassword(inputPassword string) (string, error) {
	var err error

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
