package cache

func Setup(entity *CacheEntity) {
	if entity == nil {
		panic("cache entity is nil")
	}
	entity.Default()

	var cache AdapterCache

	switch entity.Driver {
	case MemoryDriver:
		cache = NewMemory(entity.Prefix, entity.Memory)
	case RedisDriver:
		if entity.Redis.Addr == "" || entity.Redis.Password == "" {
			panic("redis addr or password is required")
		}
		cache = NewRedis(entity.Prefix, entity.Redis)
	case RedisClusterDriver:
		if len(entity.RedisCluster.Addrs) == 0 || entity.RedisCluster.Password == "" {
			panic("redis cluster addrs or password is required")
		}
		cache = NewRedisCluster(entity.Prefix, entity.RedisCluster)
	default:
		panic("invalid cache driver")
	}

	Cache = cache
}
