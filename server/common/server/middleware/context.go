package middleware

import (
	"server/common"

	"github.com/gin-gonic/gin"
)

// Context
func Context() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
		common.ClearRequestID()
		common.ClearLoginUserID()
	}
}
