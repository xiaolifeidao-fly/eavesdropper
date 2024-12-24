package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCluster struct {
	client *redis.ClusterClient
	prefix string
}

func NewRedisCluster(prefix string, entity RedisClusterEntity) *RedisCluster {
	rdb := redis.NewClusterClient(&redis.ClusterOptions{
		Addrs:    entity.Addrs,
		Password: entity.Password,
	})
	return &RedisCluster{client: rdb, prefix: prefix}
}

func (m *RedisCluster) BuildKey(key string) string {
	return m.prefix + ":" + key
}

func (m *RedisCluster) String() string {
	return RedisClusterDriver
}

func (m *RedisCluster) Get(key string) (string, error) {
	val, err := m.client.Get(context.TODO(), m.BuildKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return "", ErrKeyNotFound
		}
		return "", err
	}
	return val, nil
}

func (m *RedisCluster) SetEx(key string, val interface{}, expire int) error {
	if err := m.client.Set(context.TODO(), m.BuildKey(key), val, time.Duration(expire)*time.Second).Err(); err != nil {
		if err == redis.Nil {
			return ErrKeyNotFound
		}
		return err
	}
	return nil
}

func (m *RedisCluster) Del(key string) error {
	if err := m.client.Del(context.TODO(), m.BuildKey(key)).Err(); err != nil {
		if err == redis.Nil {
			return ErrKeyNotFound
		}
		return err
	}
	return nil
}

func (m *RedisCluster) Expire(key string, dur time.Duration) error {
	if err := m.client.Expire(context.TODO(), m.BuildKey(key), dur).Err(); err != nil {
		if err == redis.Nil {
			return ErrKeyNotFound
		}
		return err
	}
	return nil
}

func (m *RedisCluster) GetExpire(key string) (int64, error) {
	ttl, err := m.client.TTL(context.TODO(), m.BuildKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return 0, ErrKeyNotFound
		}
		return 0, err
	}
	return int64(ttl.Seconds()), nil
}
