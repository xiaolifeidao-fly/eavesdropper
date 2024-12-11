package constants

import (
	"time"
)

const (
	PasswordSecret = "dwnqY8" // 随机字符数字

	LoginUserCacheKey = "user:%d"          // 登录用户缓存key
	LoginUserCacheTTL = 1 * 24 * time.Hour // 登录用户缓存过期时间

	LoginCaptchaCacheKey = "login:captcha:%s" // 登录验证码缓存key
	LoginCaptchaCacheTTL = 5 * time.Minute    // 登录验证码缓存过期时间
)
