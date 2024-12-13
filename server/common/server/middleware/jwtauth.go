package middleware

import (
	"errors"
	"fmt"
	"server/common"
	"server/common/encryption"
	"server/common/logger"
	serverCommon "server/common/server/common"
	"server/common/server/response"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	TokenSecret = "kgje*_qmk" // 登录凭证密钥

	LoginUserTokenCacheKey = "login:user:token:%d" // 登录用户凭证缓存key
	LoginUserTokenCacheTTL = 7 * 24 * time.Hour    // 登录用户凭证缓存过期时间
	LoginUserIDCacheKey    = "login:user:id:%s"    // 登录用户ID缓存key
	LoginUserIDCacheTTL    = 7 * 24 * time.Hour    // 登录用户ID缓存过期时间
)

// Authorization
func Authorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		var err error

		accessToken := c.GetHeader(serverCommon.AuthHeader)
		if accessToken == "" || accessToken == "undefined" {
			response.Error(c, "未登录")
			return
		}

		// 获取登录用户ID
		var userID uint64
		if userID, err = getLoginUserIDByLoginToken(accessToken); err != nil {
			logger.Errorf("Authorization failed, with error is %v", err)
			response.Error(c, "未登录")
			return
		}

		if userID == 0 {
			response.Error(c, "未登录")
			return
		}

		// 设置登录用户
		gContext := common.GetContext()
		gContext.Set(common.LoginUserIDKey, userID)

		// 刷新登录凭证缓存
		refreshLoginToken(userID, accessToken)

		c.Next()
	}
}

// getLoginUserIDByLoginToken
// @Description 通过登录凭证获取登录用户ID
func getLoginUserIDByLoginToken(loginToken string) (uint64, error) {
	var err error
	var userIDStr string

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserIDCacheKey, loginToken)
	if userIDStr, err = cacheAdapter.Get(cacheKey); err != nil {
		return 0, err
	}

	if userIDStr == "" {
		return 0, errors.New("未登录")
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

// GenerateLoginToken
// @Description 生成登录凭证
func GenerateLoginToken(userID uint64) (string, error) {
	var err error

	// 查询是否登录过
	var loginToken string
	if loginToken, err = getLoginTokenByUserID(userID); err != nil {
		return "", err
	}

	if loginToken == "" {
		// 通过雪花算法生成唯一登录凭证
		loginToken = encryption.Encryption(TokenSecret, common.SnowflakeUtil.NextValString())
	}

	if err = refreshLoginToken(userID, loginToken); err != nil {
		return "", err
	}

	return loginToken, nil
}

// ClearLoginToken
// @Description 清除登录凭证
func ClearLoginToken(userID uint64) error {
	var err error

	// 获取登录凭证
	var loginToken string
	if loginToken, err = getLoginTokenByUserID(userID); err != nil {
		return err
	}

	// 清除登录用户ID
	if err = clearLoginUserIDByLoginToken(loginToken); err != nil {
		return err
	}

	// 清除登录凭证
	if err = clearLoginTokenByUserID(userID); err != nil {
		return err
	}

	return nil
}

// setLoginTokenByUserID
// @Description 通过用户ID设置登录凭证
func setLoginTokenByUserID(userID uint64, loginToken string) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserTokenCacheKey, userID)
	cacheTTL := int(LoginUserTokenCacheTTL.Seconds())
	if err = cacheAdapter.Set(cacheKey, loginToken, cacheTTL); err != nil {
		return err
	}

	return nil
}

// getLoginTokenByUserID
// @Description 通过用户ID获取登录凭证
func getLoginTokenByUserID(userID uint64) (string, error) {
	var err error
	var token string

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserTokenCacheKey, userID)
	if token, err = cacheAdapter.Get(cacheKey); err != nil {
		return "", err
	}
	return token, nil
}

// clearLoginTokenByUserID
// @Description 通过用户ID清除登录凭证
func clearLoginTokenByUserID(userID uint64) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserTokenCacheKey, userID)
	if err = cacheAdapter.Del(cacheKey); err != nil {
		return err
	}

	return nil
}

// setLoginUserIDByLoginToken
// @Description 通过登录凭证设置登录用户ID
func setLoginUserIDByLoginToken(loginToken string, userID uint64) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserIDCacheKey, loginToken)
	cacheTTL := int(LoginUserIDCacheTTL.Seconds())
	if err = cacheAdapter.Set(cacheKey, userID, cacheTTL); err != nil {
		return err
	}

	return nil
}

// refreshLoginToken
// @Description 刷新登录凭证
func refreshLoginToken(userID uint64, loginToken string) error {
	var err error

	// 设置登录用户ID
	if err = setLoginUserIDByLoginToken(loginToken, userID); err != nil {
		return err
	}

	// 刷新登录凭证缓存
	if err = setLoginTokenByUserID(userID, loginToken); err != nil {
		return err
	}
	return nil
}

// clearLoginUserIDByLoginToken
// @Description 通过登录凭证清除登录用户ID
func clearLoginUserIDByLoginToken(loginToken string) error {
	var err error

	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(LoginUserIDCacheKey, loginToken)
	if err = cacheAdapter.Del(cacheKey); err != nil {
		return err
	}

	return nil
}
