package constants

import (
	"time"
)

const (
	LoginUserCacheKey = "user:%d"          // 登录用户缓存key
	LoginUserCacheTTL = 1 * 24 * time.Hour // 登录用户缓存过期时间

	AuthCaptchaCacheKey = "auth:captcha:%s" // 验证码缓存key
	AuthCaptchaCacheTTL = 5 * time.Minute   // 验证码缓存过期时间

	AuthPassword = "密码错误"
	AuthCaptcha  = "验证码错误"
)
