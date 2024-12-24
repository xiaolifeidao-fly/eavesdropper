package cache

import (
	"errors"
	"time"
)

var Cache AdapterCache

const (
	MemoryDriver       = "memory"
	RedisDriver        = "redis"
	RedisClusterDriver = "redisCluster"
)

const (
	DefaultExpiration      = time.Duration(10 * time.Second) // 默认过期时间
	DefaultCleanupInterval = time.Duration(10 * time.Second) // 每10秒清理一次
)

var (
	ErrKeyNotFound         = errors.New("key not found")
	ErrCacheNotInitialized = errors.New("cache is not initialized")
)

// AdapterCache 适配器缓存
type AdapterCache interface {
	BuildKey(key string) string                          // 构建key
	String() string                                      // 返回适配器名称
	Get(key string) (string, error)                      // 获取值
	SetEx(key string, val interface{}, expire int) error // 设置值，并设置过期时间
	Del(key string) error                                // 删除值
	Expire(key string, dur time.Duration) error          // 设置过期时间
	GetExpire(key string) (int64, error)                 // 获取过期时间
}

func Get(key string) (string, error) {
	if Cache == nil {
		return "", ErrCacheNotInitialized
	}

	return Cache.Get(key)
}

func SetEx(key string, val interface{}, expire int) error {
	if Cache == nil {
		return ErrCacheNotInitialized
	}

	return Cache.SetEx(key, val, expire)
}

func Del(key string) error {
	if Cache == nil {
		return ErrCacheNotInitialized
	}

	return Cache.Del(key)
}

func Expire(key string, dur time.Duration) error {
	if Cache == nil {
		return ErrCacheNotInitialized
	}

	return Cache.Expire(key, dur)
}

func GetExpire(key string) (int64, error) {
	if Cache == nil {
		return 0, ErrCacheNotInitialized
	}

	return Cache.GetExpire(key)
}
