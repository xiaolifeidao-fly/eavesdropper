package cache

var Entity = new(CacheEntity)

type CacheEntity struct {
	Driver       string             `json:"driver"` // 驱动, memory, redis, redisCluster
	Prefix       string             `json:"prefix"`
	Memory       MemoryEntity       `json:"memory"`
	Redis        RedisEntity        `json:"redis"`
	RedisCluster RedisClusterEntity `json:"redisCluster"`
}

func (entity *CacheEntity) Default() {
	// 默认驱动
	if entity.Driver == "" {
		entity.Driver = "memory"
	}
	if entity.Prefix == "" {
		entity.Prefix = "dev"
	}
	if entity.Memory.DefaultExpiration == 0 {
		entity.Memory.DefaultExpiration = int64(DefaultExpiration)
	}
	if entity.Memory.CleanupInterval == 0 {
		entity.Memory.CleanupInterval = int64(DefaultCleanupInterval)
	}
}

// MemoryEntity 内存缓存配置
type MemoryEntity struct {
	DefaultExpiration int64 `json:"defaultExpiration"`
	CleanupInterval   int64 `json:"cleanupInterval"`
}

// RedisEntity 单机Redis配置
type RedisEntity struct {
	Addr     string `json:"addr"`
	Password string `json:"password"`
}

// RedisClusterEntity Redis集群配置
type RedisClusterEntity struct {
	Addrs    []string `json:"addrs"`
	Password string   `json:"password"`
}
