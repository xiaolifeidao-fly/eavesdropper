package common

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetOrGenerateRequestID 生成msgId
func GetOrGenerateRequestID(c *gin.Context) string {
	requestId := c.GetHeader(RequestIdKey)
	if requestId == "" {
		requestId = c.GetHeader(strings.ToLower(RequestIdKey))
	}

	if requestId == "" {
		requestId = uuid.New().String()
	}
	return requestId
}
