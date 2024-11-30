package concurrent

import (
	"fmt"
	"runtime"
	"strconv"
	"strings"
	"sync"
)

type ThreadLocal struct {
	store sync.Map
}

func NewThreadLocal() *ThreadLocal {
	return &ThreadLocal{}
}

// Set 将值存储到当前协程的上下文中
func (tl *ThreadLocal) Set(value interface{}) {
	id := getGoroutineID()
	tl.store.Store(id, value)
}

// Get 从当前协程的上下文中获取值
func (tl *ThreadLocal) Get() (interface{}, bool) {
	id := getGoroutineID()
	return tl.store.Load(id)
}

// Delete 删除当前协程的存储值
func (tl *ThreadLocal) Delete() {
	tl.store.Delete(getGoroutineID())
}

// getGoroutineID 获取当前 goroutine 的唯一 ID
func getGoroutineID() int {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("panic recover: panic info:", err)
		}
	}()

	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	idField := strings.Fields(strings.TrimPrefix(string(buf[:n]), "goroutine "))[0]
	id, err := strconv.Atoi(idField)
	if err != nil {
		panic(fmt.Sprintf("cannot get goroutine id: %v", err))
	}
	fmt.Println("getGoroutineID", id)
	return id
}
