package common

import (
	"fmt"
	"server/common"
)

const (
	AuthHeader     = "Authorization"
	LoginUserIDKey = common.LoginUserIDKey

	NoLogin    = "未登录"
	TokenError = "token错误"
)

// SetTokenCache
// @Description 设置Token缓存
func SetTokenCache(userID uint64, token string) error {
	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cacheAdapter.Set(cacheKey, token, int(common.LoginUserTokenCacheTTL.Seconds()))
}

// CheckTokenCache
// @Description 检查Token缓存
func CheckTokenCache(userID uint64, token string) bool {
	cacheValue, err := GetTokenCache(userID)
	if err != nil {
		return false
	}
	return cacheValue == token
}

// GetTokenCache
// @Description 获取Token缓存
func GetTokenCache(userID uint64) (string, error) {
	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cacheAdapter.Get(cacheKey)
}

// ClearTokenCache
// @Description 清除Token缓存
func ClearTokenCache(userID uint64) error {
	cacheAdapter := common.Runtime.GetCacheAdapter()
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cacheAdapter.Del(cacheKey)
}
