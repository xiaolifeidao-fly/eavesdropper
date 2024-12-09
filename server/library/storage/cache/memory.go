package cache

import (
	"fmt"
	"strconv"
	"sync"
	"time"

	"github.com/spf13/cast"
)

type item struct {
	Value   string
	Expired time.Time
}

type Memory struct {
	prefix string // 缓存前缀
	items  *sync.Map
	mutex  sync.RWMutex
}

// NewMemory memory模式
func NewMemory(prefix string) *Memory {
	cache := &Memory{
		prefix: prefix,
		items:  new(sync.Map),
	}

	cache.connect()
	return cache
}

func (m *Memory) BuildKey(key string) string {
	return m.prefix + "_" + key
}

func (*Memory) String() string {
	return "memory"
}

func (m *Memory) connect() {
}

func (m *Memory) Get(key string) (string, error) {
	key = m.BuildKey(key)

	v, err := m.getItem(key)
	if err != nil || v == nil {
		return "", err
	}
	return v.Value, nil
}

func (m *Memory) getItem(key string) (*item, error) {
	key = m.BuildKey(key)

	var err error
	i, ok := m.items.Load(key)
	if !ok {
		return nil, nil
	}
	switch i.(type) {
	case *item:
		v := i.(*item)
		if v.Expired.Before(time.Now()) {
			//过期
			_ = m.del(key)
			//过期后删除
			return nil, nil
		}
		return v, nil
	default:
		err = fmt.Errorf("value of %s type error", key)
		return nil, err
	}
}

func (m *Memory) Set(key string, val interface{}, expire int) error {
	key = m.BuildKey(key)

	s, err := cast.ToStringE(val)
	if err != nil {
		return err
	}
	v := &item{
		Value:   s,
		Expired: time.Now().Add(time.Duration(expire) * time.Second),
	}
	return m.setItem(key, v)
}

func (m *Memory) setItem(key string, item *item) error {
	key = m.BuildKey(key)

	m.items.Store(key, item)
	return nil
}

func (m *Memory) Del(key string) error {
	key = m.BuildKey(key)

	return m.del(key)
}

func (m *Memory) del(key string) error {
	key = m.BuildKey(key)

	m.items.Delete(key)
	return nil
}

func (m *Memory) HashGet(hk, key string) (string, error) {
	key = m.BuildKey(key)

	v, err := m.getItem(hk + key)
	if err != nil || v == nil {
		return "", err
	}
	return v.Value, err
}

func (m *Memory) HashDel(hk, key string) error {
	key = m.BuildKey(key)

	return m.del(hk + key)
}

func (m *Memory) Increase(key string) error {
	key = m.BuildKey(key)

	return m.calculate(key, 1)
}

func (m *Memory) Decrease(key string) error {
	key = m.BuildKey(key)

	return m.calculate(key, -1)
}

func (m *Memory) calculate(key string, num int) error {
	key = m.BuildKey(key)

	m.mutex.RLock()
	defer m.mutex.RUnlock()
	v, err := m.getItem(key)
	if err != nil {
		return err
	}

	if v == nil {
		err = fmt.Errorf("%s not exist", key)
		return err
	}
	var n int
	n, err = cast.ToIntE(v.Value)
	if err != nil {
		return err
	}
	n += num
	v.Value = strconv.Itoa(n)
	return m.setItem(key, v)
}

func (m *Memory) Expire(key string, dur time.Duration) error {
	key = m.BuildKey(key)

	m.mutex.RLock()
	defer m.mutex.RUnlock()
	v, err := m.getItem(key)
	if err != nil {
		return err
	}
	if v == nil {
		err = fmt.Errorf("%s not exist", key)
		return err
	}
	v.Expired = time.Now().Add(dur)
	return m.setItem(key, v)
}

func (m *Memory) GetExpire(key string) (int64, error) {
	key = m.BuildKey(key)

	v, err := m.getItem(key)
	if err != nil {
		return 0, err
	}
	if v == nil {
		return 0, nil
	}
	return v.Expired.Unix(), nil
}
