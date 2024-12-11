package redis

import (
	"github.com/go-redis/redis"
	"time"
)

const (
	lockSuccess = 1
	lockFail    = 0
	lockLua     = `if redis.call("GET", KEYS[1]) == ARGV[1] then redis.call("DEL", KEYS[1]) return 1 else return 0 end`
)

var _ Locker = (*RedisLock)(nil)

type RedisLock struct {
	c *redis.ClusterClient
}

func NewRedisLock(c *redis.ClusterClient) *RedisLock {
	return &RedisLock{
		c: c,
	}
}

func NewInit(c *redis.ClusterClient) (*RedisLock, error) {
	if c == nil {
		return nil, ErrClientNil
	}
	return &RedisLock{
		c: c,
	}, nil
}

// Lock lock TODO 这个锁 获取锁失败，那么相关的任务逻辑就不应该继续向前执行 很适合在高并发场景下，用来争抢一些“唯一”的资源
func (rl *RedisLock) Lock(key string, random interface{}, duration time.Duration) (err error) {
	isSuccess, err := rl.c.SetNX(key, random, duration).Result()
	if err != nil {
		return
	}
	if !isSuccess {
		return ErrLock
	}

	return
}

// UnLock unlock
func (rl *RedisLock) Unlock(key string, random interface{}) (err error) {
	res, err := rl.c.Eval(lockLua, []string{key}, random).Result()
	if err != nil {
		return
	}

	if res == lockFail {
		err = ErrUnLock
		return
	}

	return
}
