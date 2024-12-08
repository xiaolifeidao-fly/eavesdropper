package goroutine

import (
	"context"
	"sync"
)

type Context struct {
	context.Context

	GoroutineID int64

	mu   sync.RWMutex
	Keys map[string]any
}

func NewContext(ctx context.Context, goroutineID int64) *Context {
	return &Context{
		Context:     ctx,
		GoroutineID: goroutineID,
		Keys:        make(map[string]any, 16),
	}
}

func (c *Context) GetGoroutineID() int64 {
	return c.GoroutineID
}

func (c *Context) SetGoroutineID(goroutineID int64) {
	c.GoroutineID = goroutineID
}

func (c *Context) Set(key string, value any) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Keys[key] = value
}

func (c *Context) Get(key string) (any, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	value, ok := c.Keys[key]
	return value, ok
}

func (c *Context) GetString(key string) string {
	value, ok := c.Get(key)
	if !ok {
		return ""
	}
	return value.(string)
}

func (c *Context) GetBool(key string) bool {
	value, ok := c.Get(key)
	if !ok {
		return false
	}
	return value.(bool)
}

func (c *Context) GetInt(key string) int {
	value, ok := c.Get(key)
	if !ok {
		return 0
	}
	return value.(int)
}

func (c *Context) GetInt64(key string) int64 {
	value, ok := c.Get(key)
	if !ok {
		return 0
	}
	return value.(int64)
}

func (c *Context) GetFloat64(key string) float64 {
	value, ok := c.Get(key)
	if !ok {
		return 0
	}
	return value.(float64)
}

func (c *Context) GetAny(key string) (any, bool) {
	return c.Get(key)
}
