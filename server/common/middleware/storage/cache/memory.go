package cache

import (
	"math"
	"time"

	"github.com/patrickmn/go-cache"
)

type Memory struct {
	cache  *cache.Cache
	prefix string // 前缀
}

func NewMemory(prefix string, entity MemoryEntity) *Memory {
	c := cache.New(time.Duration(entity.DefaultExpiration)*time.Second, time.Duration(entity.CleanupInterval)*time.Second)
	return &Memory{cache: c, prefix: prefix}
}

func (m *Memory) BuildKey(key string) string {
	return m.prefix + ":" + key
}

func (m *Memory) String() string {
	return MemoryDriver
}

func (m *Memory) Get(key string) (string, error) {
	val, ok := m.cache.Get(m.BuildKey(key))
	if !ok {
		return "", ErrKeyNotFound
	}
	return val.(string), nil
}

func (m *Memory) SetEx(key string, val interface{}, expire int) error {
	m.cache.Set(m.BuildKey(key), val, time.Duration(expire)*time.Second)
	return nil
}

func (m *Memory) Del(key string) error {
	m.cache.Delete(m.BuildKey(key))
	return nil
}

func (m *Memory) Expire(key string, dur time.Duration) error {
	m.cache.Set(m.BuildKey(key), "", dur)
	return nil
}

func (m *Memory) GetExpire(key string) (int64, error) {
	_, expire, ok := m.cache.GetWithExpiration(m.BuildKey(key))
	if !ok {
		return 0, ErrKeyNotFound
	}

	now := time.Now()
	diff := expire.Sub(now)
	return int64(math.Ceil(diff.Seconds())), nil
}
