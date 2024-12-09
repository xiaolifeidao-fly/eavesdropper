package services

import (
	"encoding/json"
	"fmt"
	"server/common"
	"server/common/encryption"
	"server/internal/auth/common/constants"
	"server/internal/auth/common/errors"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

const (
	LoginUserCacheKey = constants.LoginUserCacheKey
	LoginUserCacheTTL = constants.LoginUserCacheTTL
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

// checkPassword
// @Description 验证密码
func checkPassword(inputPassword, dbPassword string) error {
	// TODO 验证密码
	if encryption.Encryption(inputPassword, dbPassword) != dbPassword {
		return nil
	}
	return nil
}

// GetLoginUser
// @Description 获取登录用户信息
func GetLoginUser(resp *dto.LoginUserResp) error {
	var err error
	logger := common.GetLogger()

	loginUserID := common.GetLoginUserID()

	// 从缓存中获取登录用户信息
	if err = getLoginUserFromCache(loginUserID, resp); err != nil {
		logger.Errorf("GetLoginUser failed, with error is %v", err)
		return errors.ErrAuthCache
	}

	if resp.ID != 0 {
		return nil
	}

	// 从数据库中获取登录用户信息
	userRepository := repositories.NewUserRepository()
	dbUser := &models.User{}
	if err = userRepository.FindByID(loginUserID, dbUser); err != nil {
		return err
	}

	// 将数据库用户转换为登录用户
	resp.FromUser(dbUser)

	// 将登录用户信息缓存到redis中
	if err = cacheLoginUser(loginUserID, resp); err != nil {
		logger.Errorf("CacheLoginUser failed, with error is %v", err)
		return errors.ErrAuthCache
	}

	return nil
}

// getLoginUserFromCache
// @Description 从缓存中获取登录用户信息
func getLoginUserFromCache(loginUserID uint64, resp *dto.LoginUserResp) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserCacheKey, loginUserID)

	var cacheData string
	if cacheData, err = cacheAdapter.Get(cacheKey); err != nil {
		return err
	}

	if cacheData == "" {
		return nil
	}

	if err = json.Unmarshal([]byte(cacheData), resp); err != nil {
		return err
	}

	return nil
}

// cacheLoginUser
// @Description 缓存登录用户信息
func cacheLoginUser(loginUserID uint64, resp *dto.LoginUserResp) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserCacheKey, loginUserID)

	cacheData, err := json.Marshal(resp)
	if err != nil {
		return err
	}

	if err = cacheAdapter.Set(cacheKey, cacheData, int(LoginUserCacheTTL.Seconds())); err != nil {
		return err
	}

	return nil
}

// RecordLoginLog
// @Description 登录成功记录登录日志
func RecordLoginLog(req *dto.LoginRecordReq) error {
	var err error
	userLoginRecordRepository := repositories.NewUserLoginRecordRepository()

	userLoginRecord := &models.UserLoginRecord{}
	req.ToUserLoginRecord(userLoginRecord)
	if err = userLoginRecordRepository.Create(userLoginRecord); err != nil {
		return err
	}

	return nil
}
