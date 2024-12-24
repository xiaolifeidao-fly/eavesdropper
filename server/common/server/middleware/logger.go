package middleware

import (
	"fmt"
	"net/http"
	"time"

	"server/common"
	"server/common/logger"
	serverCommon "server/common/server/common"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Logger 日志中间件
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		// 设置requestId
		requestId := uuid.New().String()
		common.SetRequestID(requestId) // 设置到goroutine context中

		// 记录请求开始时间
		startTime := time.Now()
		c.Next() // 执行后续中间件
		// 记录请求结束时间
		endTime := time.Now()

		// 打印请求日志
		requestLog(c, startTime, endTime)
	}
}

// requestLog 打印请求日志
func requestLog(c *gin.Context, startTime time.Time, endTime time.Time) {
	// 请求方式
	reqMethod := c.Request.Method
	// 请求路由
	reqUri := c.Request.RequestURI
	// 状态码
	statusCode := c.Writer.Status()
	// 请求IP
	clientIP := serverCommon.GetClientIP(c)
	// 执行时间
	latencyTime := float64(endTime.Sub(startTime).Microseconds()) / 1000
	// 日志格式

	msgStr := fmt.Sprintf("status: %d, latency: %vms, clientIP: %s, method: %s, uri: %s", statusCode, latencyTime, clientIP, reqMethod, reqUri)

	logger.Info(msgStr)
}
