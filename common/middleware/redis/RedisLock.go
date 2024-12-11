package redis

import (
	"errors"
	"time"
)

var (
	// ErrClientNil 客户端nil
	ErrClientNil = errors.New("client is nil")
	// ErrLock 加锁/获取锁失败
	ErrLock = errors.New("lock fail")
	// ErrUnLock 解锁失败
	ErrUnLock = errors.New("unlock fail")
)

type Locker interface {
	Lock(key string, value interface{}, duration time.Duration) (err error)
	Unlock(key string, value interface{}) (err error)
}
