package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// NewRedis redis模式
func NewRedis(client *redis.Client, prefix string, options *redis.Options) (*Redis, error) {
	if client == nil {
		client = redis.NewClient(options)
	}
	r := &Redis{
		client: client,
		prefix: prefix,
	}
	err := r.connect()
	if err != nil {
		return nil, err
	}
	return r, nil
}

// Redis cache implement
type Redis struct {
	client *redis.Client
	prefix string
}

func (*Redis) String() string {
	return "redis"
}

// buildKey 构建key
func (r *Redis) BuildKey(key string) string {
	return r.prefix + "_" + key
}

// connect connect test
func (r *Redis) connect() error {
	var err error
	_, err = r.client.Ping(context.TODO()).Result()
	return err
}

// Get from key
func (r *Redis) Get(key string) (string, error) {
	key = r.BuildKey(key)

	v, err := r.client.Get(context.TODO(), key).Result()
	if err == redis.Nil {
		return v, nil
	}
	return v, err
}

// Set value with key and expire time
func (r *Redis) Set(key string, val interface{}, expire int) error {
	key = r.BuildKey(key)

	err := r.client.Set(context.TODO(), key, val, time.Duration(expire)*time.Second).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

// Del delete key in redis
func (r *Redis) Del(key string) error {
	key = r.BuildKey(key)

	err := r.client.Del(context.TODO(), key).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

// 获取过期时间
func (r *Redis) GetExpire(key string) (int64, error) {
	key = r.BuildKey(key)
	v, err := r.client.TTL(context.TODO(), key).Result()
	if err == redis.Nil {
		return 0, nil
	}
	return int64(v.Seconds()), err
}

// HashGet from key
func (r *Redis) HashGet(hk, key string) (string, error) {
	key = r.BuildKey(key)

	v, err := r.client.HGet(context.TODO(), hk, key).Result()
	if err == redis.Nil {
		return v, nil
	}
	return v, err
}

// HashDel delete key in specify redis's hashtable
func (r *Redis) HashDel(hk, key string) error {
	key = r.BuildKey(key)

	err := r.client.HDel(context.TODO(), hk, key).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

// Increase increase
func (r *Redis) Increase(key string) error {
	key = r.BuildKey(key)

	err := r.client.Incr(context.TODO(), key).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

func (r *Redis) Decrease(key string) error {
	key = r.BuildKey(key)

	err := r.client.Decr(context.TODO(), key).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

// Expire ttl
func (r *Redis) Expire(key string, dur time.Duration) error {
	key = r.BuildKey(key)

	err := r.client.Expire(context.TODO(), key, dur).Err()
	if err == redis.Nil {
		return nil
	}
	return err
}

// GetClient 暴露原生client
func (r *Redis) GetClient() *redis.Client {
	return r.client
}
