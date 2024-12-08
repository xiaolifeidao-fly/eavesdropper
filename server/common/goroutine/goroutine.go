package goroutine

import (
	"sync"
)

type GoroutineLocal struct {
	sync.RWMutex // 读写锁

	goroutineMap map[int64]*Context
}

var goroutineMap = &GoroutineLocal{
	goroutineMap: make(map[int64]*Context, 1024),
}

func GetContext(id int64) *Context {
	goroutineMap.RLock()
	defer goroutineMap.RUnlock()
	return goroutineMap.goroutineMap[id]
}

func SetContext(id int64, ctx *Context) {
	goroutineMap.Lock()
	defer goroutineMap.Unlock()
	goroutineMap.goroutineMap[id] = ctx
}

func DeleteContext(id int64) {
	goroutineMap.Lock()
	defer goroutineMap.Unlock()
	delete(goroutineMap.goroutineMap, id)
}
