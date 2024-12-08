package middleware

import (
	"runtime"
	"server/common/server/response"

	"github.com/gin-gonic/gin"
)

// Error 错误处理
func Error() gin.HandlerFunc {
	return func(c *gin.Context) {

		defer func() {
			if err := recover(); err != nil {
				if c.IsAborted() {
					c.Status(200)
				}

				switch errStr := err.(type) {
				case runtime.Error:
					response.Error(c, errStr.Error())
				default:
					panic(err)
				}
			}
		}()
		c.Next()
	}
}
