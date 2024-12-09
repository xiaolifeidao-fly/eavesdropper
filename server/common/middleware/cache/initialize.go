package cache

import (
	"context"
	"server/common"
	"server/library/storage"
	"server/library/storage/cache"

	"github.com/redis/go-redis/v9"
)

var CacheConfig = new(Cache)

type Cache struct {
	Redis  *Redis  `json:"redis"`
	Memory *Memory `json:"memory"`
}

// Setup 初始化缓存 构造cache 顺序 redis > memory
func Setup() {
	var err error

	var cacheAdapter storage.AdapterCache
	if CacheConfig.Redis != nil {
		cacheAdapter, err = cache.NewRedis(GetRedisClient(), CacheConfig.Redis.Prefix, CacheConfig.Redis.GetOptions())
	} else if CacheConfig.Memory != nil {
		memory := CacheConfig.Memory
		cacheAdapter = cache.NewMemory(memory.Prefix)
	}

	if err != nil {
		panic(err)
	}

	common.Runtime.SetCacheAdapter(cacheAdapter)
}

var _redis *redis.Client

// GetRedisClient 获取redis客户端
func GetRedisClient() *redis.Client {
	return _redis
}

// SetRedisClient 设置redis客户端
func SetRedisClient(c *redis.Client) {
	if _redis != nil && _redis != c {
		_redis.Shutdown(context.TODO())
	}
	_redis = c
}
