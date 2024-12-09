package common

import "time"

const (
	LoggerKey      = "_logger-request"
	RequestIdKey   = "X-Request-Id"
	LoginUserIDKey = "loginUserID"

	LoginUserTokenCacheKey = "user_token:%d"    // 登录用户Token缓存key
	LoginUserTokenCacheTTL = 7 * 24 * time.Hour // 登录用户Token缓存过期时间
)
