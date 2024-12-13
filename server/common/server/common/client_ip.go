package common

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// GetClientIP 获取客户端IP
func GetClientIP(c *gin.Context) string {
	ClientIP := c.ClientIP()
	// 如果是 IPv6 映射地址，解析为 IPv4
	ClientIP = strings.TrimPrefix(ClientIP, "::ffff:")
	if ClientIP == "::1" {
		ClientIP = "127.0.0.1"
	}
	return ClientIP
}
