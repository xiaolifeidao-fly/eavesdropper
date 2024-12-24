package common

import (
	"fmt"
	"server/common"
	"server/common/middleware/storage/cache"
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
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cache.SetEx(cacheKey, token, int(common.LoginUserTokenCacheTTL.Seconds()))
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
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cache.Get(cacheKey)
}

// ClearTokenCache
// @Description 清除Token缓存
func ClearTokenCache(userID uint64) error {
	cacheKey := fmt.Sprintf(common.LoginUserTokenCacheKey, userID)
	return cache.Del(cacheKey)
}
