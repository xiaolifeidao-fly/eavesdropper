package common

import (
	"context"
	"server/common/goroutine"
)

// GetContext
// 从Local中获取goroutine context
// 如果Local中没有，则创建一个新的goroutine context，并设置到Local中
func GetContext() *goroutine.Context {
	goroutineID := goroutine.GetGoroutineID()

	ctx := goroutine.GetContext(goroutineID)
	if ctx == nil {
		ctx = goroutine.NewContext(context.Background(), goroutineID)
		goroutine.SetContext(goroutineID, ctx)
	}

	return ctx
}

// ClearContext
// 释放Local中的goroutine context
func ClearContext() {
	goroutine.DeleteContext(goroutine.GetGoroutineID())
}

// GetLoginUserID
// 从goroutine context中获取登录用户ID
func GetLoginUserID() uint64 {
	gContext := GetContext()

	data, ok := gContext.Get(LoginUserIDKey)
	if !ok {
		return 0
	}

	return uint64(data.(float64))
}
