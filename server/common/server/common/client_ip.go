package common

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// GetClientIP 获取客户端IP
func GetClientIP(c *gin.Context) string {
	ClientIP := c.ClientIP()
	RemoteIP := c.RemoteIP()
	ip := c.Request.Header.Get("X-Forwarded-For")
	if strings.Contains(ip, "127.0.0.1") || ip == "" {
		ip = c.Request.Header.Get("X-real-ip")
	}

	if ip == "" {
		ip = "127.0.0.1"
	}
	if RemoteIP != "127.0.0.1" {
		ip = RemoteIP
	}
	if ClientIP != "127.0.0.1" {
		ip = ClientIP
	}
	return ip
}
