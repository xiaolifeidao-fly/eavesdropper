package middleware

import (
	"server/common"

	"github.com/gin-gonic/gin"
)

// Context
func Context() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_ = common.GetContext()
		ctx.Next()
		common.ClearContext() // 清除goroutine context
	}
}
