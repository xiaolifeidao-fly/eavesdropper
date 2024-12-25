package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Redis struct {
	client *redis.Client
	prefix string
}

func NewRedis(prefix string, entity RedisEntity) *Redis {
	rdb := redis.NewClient(&redis.Options{
		Addr:     entity.Addr,
		Password: entity.Password,
		DB:       0,
	})
	return &Redis{client: rdb, prefix: prefix}
}

func (m *Redis) BuildKey(key string) string {
	return m.prefix + ":" + key
}

func (m *Redis) String() string {
	return RedisDriver
}

func (m *Redis) Get(key string) (string, error) {
	val, err := m.client.Get(context.TODO(), m.BuildKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil
		}
		return "", err
	}
	return val, nil
}

func (m *Redis) SetEx(key string, val interface{}, expire int) error {
	if err := m.client.Set(context.TODO(), m.BuildKey(key), val, time.Duration(expire)*time.Second).Err(); err != nil {
		if err == redis.Nil {
			return ErrKeyNotFound
		}
		return err
	}
	return nil
}

func (m *Redis) Del(key string) error {
	if err := m.client.Del(context.TODO(), m.BuildKey(key)).Err(); err != nil {
		if err == redis.Nil {
			return nil
		}
		return err
	}
	return nil
}

func (m *Redis) Expire(key string, dur time.Duration) error {
	if err := m.client.Expire(context.TODO(), m.BuildKey(key), dur).Err(); err != nil {
		if err == redis.Nil {
			return ErrKeyNotFound
		}
		return err
	}
	return nil
}

func (m *Redis) GetExpire(key string) (int64, error) {
	ttl, err := m.client.TTL(context.TODO(), m.BuildKey(key)).Result()
	if err != nil {
		if err == redis.Nil {
			return 0, nil
		}
		return 0, err
	}
	return int64(ttl.Seconds()), nil
}
