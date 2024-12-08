package middleware

import (
	"server/common"
	serverCommon "server/common/server/common"

	"github.com/gin-gonic/gin"
)

// WithContextDB 为每个请求设置数据库连接
// Description: 根据请求的host获取数据库连接，并设置到context中
// Deprecated: 暂时不使用此函数去管理数据库
func WithContextDB() gin.HandlerFunc {
	return func(c *gin.Context) {
		db := common.Runtime.GetDbByKey(c.Request.Host)
		db.WithContext(c)

		c.Set(serverCommon.DbKey, db)
		c.Next()
	}
}
