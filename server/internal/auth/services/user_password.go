package services

// // CheckUserPassword
// // @Description 验证密码
// func CheckUserPassword(userID uint64, password string) error {
// 	var err error
// 	userPasswordRepository := repositories.NewUserPasswordRepository()

// 	userPassword := &models.UserPassword{}
// 	if err = userPasswordRepository.FindByUserID(userID, userPassword); err != nil {
// 		return err
// 	}

// 	if err = checkPassword(password, userPassword.Password); err != nil {
// 		return err
// 	}

// 	return nil
// }

// // checkPassword
// // @Description 验证密码
// func checkPassword(inputPassword, dbPassword string) error {
// 	var err error

// 	// 加密密码
// 	var encryptedPassword string
// 	if encryptedPassword, err = encryptPassword(inputPassword); err != nil {
// 		return err
// 	}

// 	if encryptedPassword != dbPassword {
// 		return errors.New(constants.PasswordIncorrect)
// 	}

// 	return nil
// }

// // encryptPassword
// // @Description 不可逆加密密码
// func encryptPassword(inputPassword string) (string, error) {
// 	var err error

// 	// 解密密码
// 	var decryptedPassword string
// 	if decryptedPassword, err = encryption.DecryptRSA(inputPassword, common.GetPrivateKey()); err != nil {
// 		return "", err
// 	}

// 	passwordMd2 := encryption.Md5(encryption.Md5(decryptedPassword))
// 	encryptedPassword := encryption.Encryption(constants.PasswordSecret, passwordMd2)
// 	return encryptedPassword, nil
// }

// // encryptOriPassword
// // @Description 加密原始密码
// func encryptOriPassword(inputPassword string) (string, error) {
// 	var err error

// 	if inputPassword, err = encryption.DecryptRSA(inputPassword, common.GetPrivateKey()); err != nil {
// 		return "", err
// 	}

// 	secret := []byte(constants.OriPasswordSecret)
// 	encrypted, err := encryption.EncryptAES([]byte(inputPassword), secret)
// 	if err != nil {
// 		return "", err
// 	}
// 	return encrypted, nil
// }

// // decryptOriPassword
// // @Description 解密原始密码
// func decryptOriPassword(password string) (string, error) {
// 	secret := []byte(constants.OriPasswordSecret)
// 	decryptedPassword, err := encryption.DecryptAES(password, secret)
// 	if err != nil {
// 		return "", err
// 	}
// 	return string(decryptedPassword), nil
// }
