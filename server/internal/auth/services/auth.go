package services

import (
	"encoding/json"
	"fmt"
	"server/common"
	"server/common/captcha"
	"server/common/middleware/jwtauth"
	serverCommon "server/common/server/common"
	"server/internal/auth/common/constants"
	"server/internal/auth/common/errors"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

// Login
// @Description 登录
func Login(req *dto.LoginReq, resp *dto.LoginResp) error {
	var err error
	userRepository := repositories.NewUserRepository()

	dbUser := &models.User{}
	if err = userRepository.FindByUsername(req.Username, dbUser); err != nil {
		return err
	}

	if dbUser.ID == 0 {
		return errors.ErrUserNotFound
	}

	// 验证密码
	if err = CheckUserPassword(dbUser.ID, req.Password); err != nil {
		return err
	}

	// 生成JwtToken
	if resp.AccessToken, err = generateJwtToken(dbUser.ID); err != nil {
		return err
	}

	// 登录成功记录登录日志
	if err = loginReqSaveLoginLog(dbUser.ID, req); err != nil {
		serverCommon.ClearTokenCache(dbUser.ID)
		return err
	}

	return nil
}

// CheckLoginCaptcha
// @Description 验证登录验证码
func CheckLoginCaptcha(captchaID, captcha string) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(constants.LoginCaptchaCacheKey, captchaID)

	var cacheData string
	if cacheData, err = cacheAdapter.Get(cacheKey); err != nil {
		return err
	}

	if cacheData != captcha {
		return errors.ErrLoginCaptcha
	}

	// 清除验证码缓存
	if err = cacheAdapter.Del(cacheKey); err != nil {
		return err
	}

	return nil
}

// generateJwtToken
// @Description 生成JwtToken
func generateJwtToken(userID uint64) (string, error) {
	var err error
	var token string

	if token, err = jwtauth.GenerateJwtToken(userID); err != nil {
		return "", err
	}

	if err = serverCommon.SetTokenCache(userID, token); err != nil {
		return "", err
	}

	return token, nil
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
	cacheKey := fmt.Sprintf(constants.LoginUserCacheKey, loginUserID)

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
	cacheKey := fmt.Sprintf(constants.LoginUserCacheKey, loginUserID)

	cacheData, err := json.Marshal(resp)
	if err != nil {
		return err
	}

	cacheTTL := int(constants.LoginUserCacheTTL.Seconds())
	if err = cacheAdapter.Set(cacheKey, cacheData, cacheTTL); err != nil {
		return err
	}

	return nil
}

// clearLoginUserCache
// @Description 清除登录用户缓存
func clearLoginUserCache(loginUserID uint64) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(constants.LoginUserCacheKey, loginUserID)

	if err = cacheAdapter.Del(cacheKey); err != nil {
		return err
	}

	return nil
}

// Logout
// @Description 登出
func Logout() error {
	var err error

	loginUserID := common.GetLoginUserID()
	if err = serverCommon.ClearTokenCache(loginUserID); err != nil {
		return err
	}

	if err = clearLoginUserCache(loginUserID); err != nil {
		return err
	}

	return nil
}

// GetLoginCaptcha
// @Description 获取登录验证码
func GetLoginCaptcha(resp *dto.LoginCaptchaResp) error {
	var err error

	var captchaResult captcha.Captcha
	if captchaResult, err = captcha.GenerateStringCaptcha(); err != nil {
		return err
	}

	// 缓存验证码值
	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(constants.LoginCaptchaCacheKey, captchaResult.CaptchaID)
	cacheTTL := int(constants.LoginCaptchaCacheTTL.Seconds())
	if err = cacheAdapter.Set(cacheKey, []byte(captchaResult.CaptchaCode), cacheTTL); err != nil {
		return err
	}

	resp.CaptchaID = captchaResult.CaptchaID
	resp.CaptchaImg = captchaResult.CaptchaImg

	return nil
}
