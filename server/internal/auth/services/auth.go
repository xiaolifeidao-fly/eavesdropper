package services

import (
	"encoding/json"
	"errors"
	"fmt"

	"server/common"
	"server/common/captcha"
	"server/common/encryption"
	"server/common/middleware/logger"
	"server/common/middleware/server"
	"server/common/middleware/storage/cache"
	"server/common/server/middleware"
	authCommon "server/internal/auth/common"
	"server/internal/auth/services/converter"
	"server/internal/auth/services/dto"
	"time"
)

const (
	AuthCaptchaCacheKey = "auth:captcha:%s" // 验证码缓存key
	AuthCaptchaCacheTTL = 5 * time.Minute   // 验证码缓存过期时间

	AuthLoginUserCacheKey = "auth:login-user:%d" // 登录用户缓存key
	AuthLoginUserCacheTTL = 7 * 24 * time.Hour   // 登录用户缓存过期时间
)

// Login
// @Description 登录
func Login(loginDTO *dto.LoginDTO) (string, error) {
	var err error

	// 验证登录
	var userDTO *dto.UserDTO
	if userDTO, err = checkLogin(loginDTO); err != nil {
		return "", err
	}

	// 生成登录凭证
	var loginToken string
	if loginToken, err = middleware.GenerateLoginToken(userDTO.ID); err != nil {
		logger.Errorf("GenerateLoginToken failed, with error is %v", err)
		return "", errors.New("系统错误")
	}

	// 保存登录记录
	if err = saveUserLoginRecord(loginDTO, userDTO); err != nil {
		return "", err
	}

	return loginToken, nil
}

// checkLogin
// @Description 验证登录
func checkLogin(loginDTO *dto.LoginDTO) (*dto.UserDTO, error) {
	var err error

	// 查询用户是否存在
	var userDTO *dto.UserDTO
	if userDTO, err = getUserByMobile(loginDTO.Mobile); err != nil {
		return nil, err
	}
	if userDTO == nil || userDTO.ID == 0 {
		return nil, errors.New("用户不存在")
	}

	// 查询用户密码
	var userPasswordDTO *dto.UserPasswordDTO
	if userPasswordDTO, err = getUserPasswordByUserID(userDTO.ID); err != nil {
		return nil, err
	}
	if userPasswordDTO == nil || userPasswordDTO.ID == 0 {
		return nil, errors.New("用户不存在")
	}

	// 校验登录密码
	if err = checkPassword(loginDTO.Password, userPasswordDTO.Password); err != nil {
		return nil, err
	}

	// 验证登录验证码
	if err = checkCaptcha(loginDTO.CaptchaID, loginDTO.Captcha); err != nil {
		return nil, err
	}

	return userDTO, nil
}

// saveUserLoginRecord
// @Description 保存登录记录
func saveUserLoginRecord(loginDTO *dto.LoginDTO, userDTO *dto.UserDTO) error {
	var err error

	userLoginRecordDTO := converter.UserDTOLoginDTOToUserLoginRecordDTO(userDTO, loginDTO)
	if _, err = CreateUserLoginRecord(userLoginRecordDTO); err != nil {
		return err
	}

	return nil
}

// Register
// @Description 注册
func Register(registerDTO *dto.RegisterDTO) error {
	var err error

	// 校验注册
	if err = checkRegister(registerDTO); err != nil {
		return err
	}

	// 注册用户
	if err = registerUser(registerDTO); err != nil {
		return err
	}

	return nil
}

// checkRegister
// @Description 校验注册
func checkRegister(registerDTO *dto.RegisterDTO) error {
	var err error

	// 查询用户是否存在
	var userDTO *dto.UserDTO
	if userDTO, err = getUserByMobile(registerDTO.Mobile); err != nil {
		return err
	}
	if userDTO != nil && userDTO.ID > 0 {
		return errors.New("用户已存在")
	}

	// 验证注册验证码
	if err = checkCaptcha(registerDTO.CaptchaID, registerDTO.Captcha); err != nil {
		return err
	}

	return nil
}

// registerUser
// @Description 注册用户
func registerUser(registerDTO *dto.RegisterDTO) error {
	var err error

	var userDTO *dto.UserDTO
	userAddDTO := converter.RegisterDTOToUserAddDTO(registerDTO)
	if userDTO, err = CreateUser(userAddDTO); err != nil {
		return err
	}

	userDTO.CreatedBy = userDTO.ID
	userDTO.UpdatedBy = userDTO.ID
	if _, err = updateUser(userDTO); err != nil {
		return err
	}

	return nil
}

// checkCaptcha
// @Description 验证验证码
func checkCaptcha(captchaID, captcha string) error {
	var err error

	cacheKey := fmt.Sprintf(AuthCaptchaCacheKey, captchaID)

	if server.Entity.Mode == "dev" {
		cache.Del(cacheKey)
		return nil
	}

	var cacheData string
	if cacheData, err = cache.Get(cacheKey); err != nil {
		logger.Errorf("CheckCaptcha failed, with error is %v", err)
		return errors.New("验证码操作失败")
	}

	if cacheData != captcha {
		return errors.New("验证码错误")
	}

	// 清除验证码缓存
	cache.Del(cacheKey)

	return nil
}

// GetCaptcha
// @Description 获取验证码
func GetCaptcha() (*dto.CaptchaDTO, error) {
	var err error

	var captchaResult captcha.Captcha
	if captchaResult, err = captcha.GenerateStringCaptcha(); err != nil {
		return nil, err
	}

	// 缓存验证码值
	cacheKey := fmt.Sprintf(AuthCaptchaCacheKey, captchaResult.CaptchaID)
	cacheTTL := int(AuthCaptchaCacheTTL.Seconds())
	if err = cache.SetEx(cacheKey, []byte(captchaResult.CaptchaCode), cacheTTL); err != nil {
		return nil, err
	}

	if server.Entity.Mode == "dev" {
		logger.Infof("GetCaptcha success, with captchaCode is %s", captchaResult.CaptchaCode)
	}

	captchaDTO := converter.CaptchaResultToCaptchaDTO(&captchaResult)
	return captchaDTO, nil
}

// GetLoginUser
// @Description 获取登录用户信息
func GetLoginUser(userID uint64) (*dto.UserLoginInfoDTO, error) {
	var err error

	// 从缓存中获取用户信息
	var userLoginInfoDTO *dto.UserLoginInfoDTO
	if userLoginInfoDTO, err = getLoginUserFromCache(userID); err != nil {
		return nil, err
	}
	if userLoginInfoDTO != nil {
		return userLoginInfoDTO, nil
	}

	// 从数据库中获取用户信息
	if userLoginInfoDTO, err = getLoginUser(userID); err != nil {
		return nil, err
	}

	// 设置登录用户信息到缓存
	if err = setLoginUserToCache(userID, userLoginInfoDTO); err != nil {
		return nil, err
	}

	return userLoginInfoDTO, nil
}

// getLoginUser
// @Description 获取登录用户信息
func getLoginUser(userID uint64) (*dto.UserLoginInfoDTO, error) {
	var err error

	userInfoDTO, err := GetUserInfo(userID)
	if err != nil {
		return nil, err
	}

	userLoginInfoDTO := converter.ConverterUserLoginInfoDTO(userInfoDTO)

	// 查询用户最后一次登录记录
	userLoginRecordDTO, err := GetLastUserLoginRecord(userID)
	if err != nil {
		return nil, err
	}
	if userLoginRecordDTO != nil {
		userLoginInfoDTO.LoginAt = userLoginRecordDTO.LoginTime
	}

	return userLoginInfoDTO, nil
}

// getLoginUserFromCache
// @Description 从缓存中获取登录用户信息
func getLoginUserFromCache(userID uint64) (*dto.UserLoginInfoDTO, error) {
	var err error

	cacheKey := fmt.Sprintf(AuthLoginUserCacheKey, userID)
	var cacheData string
	if cacheData, err = cache.Get(cacheKey); err != nil {
		logger.Errorf("GetLoginUserFromCache failed, with error is %v", err)
		return nil, errors.New("系统错误")
	}

	if cacheData == "" {
		return nil, nil
	}

	var userLoginInfoDTO dto.UserLoginInfoDTO
	if err = json.Unmarshal([]byte(cacheData), &userLoginInfoDTO); err != nil {
		logger.Errorf("GetLoginUserFromCache failed, with error is %v", err)
		return nil, errors.New("系统错误")
	}

	return &userLoginInfoDTO, nil
}

// setLoginUserToCache
// @Description 设置登录用户信息到缓存
func setLoginUserToCache(userID uint64, userLoginInfoDTO *dto.UserLoginInfoDTO) error {
	var err error

	marshal, err := json.Marshal(userLoginInfoDTO)
	if err != nil {
		logger.Errorf("SetLoginUserToCache failed, with error is %v", err)
		return errors.New("系统错误")
	}

	cacheKey := fmt.Sprintf(AuthLoginUserCacheKey, userID)
	cacheTTL := int(AuthLoginUserCacheTTL.Seconds())
	if err = cache.SetEx(cacheKey, marshal, cacheTTL); err != nil {
		logger.Errorf("SetLoginUserToCache failed, with error is %v", err)
		return errors.New("系统错误")
	}

	return nil
}

// clearLoginUserCache
// @Description 清除登录用户缓存
func clearLoginUserCache(userID uint64) error {
	var err error

	cacheKey := fmt.Sprintf(AuthLoginUserCacheKey, userID)
	if err = cache.Del(cacheKey); err != nil {
		logger.Errorf("ClearLoginUserCache failed, with error is %v", err)
		return errors.New("系统错误")
	}

	return nil
}

// Logout
// @Description 登出
func Logout(userID uint64) error {
	var err error

	if err = middleware.ClearLoginToken(userID); err != nil {
		logger.Errorf("Logout failed, with error is %v", err)
		return errors.New("系统错误")
	}

	return nil
}

// UpdateAuthUser
// @Description 更新用户信息
func UpdateAuthUser(userUpdateDTO *dto.AuthUserUpdateDTO) error {
	var err error

	userID := common.GetLoginUserID()
	var userDTO *dto.UserDTO
	if userDTO, err = GetUserByID(userID); err != nil {
		return err
	}

	userDTO = converter.AuthUserUpdateDTOToUserUpdateDTO(userUpdateDTO, userDTO)
	if _, err = updateUser(userDTO); err != nil {
		return err
	}

	// 清除用户信息缓存
	if err = clearLoginUserCache(userID); err != nil {
		return err
	}

	return nil
}

// ModifyAuthUserPassword
// @Description 修改密码
func ModifyAuthUserPassword(oldPassword, newPassword string) error {
	var err error

	userID := common.GetLoginUserID()

	userPasswordDTO, err := getUserPasswordByUserID(userID)
	if err != nil {
		return err
	}

	// 校验旧密码
	if err = checkPassword(oldPassword, userPasswordDTO.Password); err != nil {
		return err
	}

	// 解密密码
	if newPassword, err = encryption.DecryptRSA(newPassword, authCommon.GetPrivateKey()); err != nil {
		logger.Errorf("DecryptRSA failed, with error is %v", err)
		return errors.New("系统错误")
	}

	encryptPassword := encryptPassword(newPassword) // 不可逆加密密码
	// 更新密码
	userPasswordDTO.Password = encryptPassword
	if _, err = updateUserPassword(userPasswordDTO); err != nil {
		return err
	}

	// 修改成功登出用户
	if err = middleware.ClearLoginToken(userID); err != nil {
		return err
	}

	return nil
}
