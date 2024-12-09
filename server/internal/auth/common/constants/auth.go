package constants

import (
	"time"
)

const (
	LoginUserCacheKey = "user:%d"          // 登录用户缓存key
	LoginUserCacheTTL = 1 * 24 * time.Hour // 登录用户缓存过期时间
)
