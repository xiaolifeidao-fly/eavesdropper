package goroutine

import (
	"github.com/petermattis/goid"
)

type ContextKey string

func GetGoroutineID() int64 {
	return goid.Get()
}
