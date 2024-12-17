package common

import (
	"server/common/goroutine"
)

// // GetContext
// // 从Local中获取goroutine context
// // 如果Local中没有，则创建一个新的goroutine context，并设置到Local中
// func GetContext() *goroutine.Context {
// 	goroutineID := goroutine.GetGoroutineID()

// 	ctx := goroutine.GetContext(goroutineID)
// 	if ctx == nil {
// 		ctx = goroutine.NewContext(context.Background(), goroutineID)
// 		goroutine.SetContext(goroutineID, ctx)
// 	}

// 	return ctx
// }

// // ClearContext
// // 释放Local中的goroutine context
// func ClearContext() {
// 	goroutine.DeleteContext(goroutine.GetGoroutineID())
// }

var loginUserIDContext = goroutine.NewThreadLocal()

// SetLoginUserID
// 设置登录用户ID
func SetLoginUserID(userID uint64) {
	loginUserIDContext.Set(userID)
}

// GetLoginUserID
// 从goroutine context中获取登录用户ID
func GetLoginUserID() uint64 {
	data, ok := loginUserIDContext.Get()
	if !ok {
		return 0
	}

	return data.(uint64)
}

// ClearLoginUserID
// 清除登录用户ID
func ClearLoginUserID() {
	loginUserIDContext.Delete()
}

var requestIDContext = goroutine.NewThreadLocal()

// SetRequestID
// 设置请求ID
func SetRequestID(requestID string) {
	requestIDContext.Set(requestID)
}

// GetRequestID
// 从goroutine context中获取请求ID
func GetRequestID() string {
	data, ok := requestIDContext.Get()
	if !ok {
		return ""
	}

	return data.(string)
}

// ClearRequestID
// 清除请求ID
func ClearRequestID() {
	requestIDContext.Delete()
}
