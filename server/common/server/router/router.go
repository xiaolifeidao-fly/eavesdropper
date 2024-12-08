package router

import (
	"os"
	"server/common"
	"server/library/logger"

	"github.com/gin-gonic/gin"
)

func GetEngine() *gin.Engine {
	h := common.Runtime.GetEngine()
	if h == nil {
		logger.Fatal("not found engine...")
		os.Exit(-1)
	}

	switch h := h.(type) {
	case *gin.Engine:
		return h
	default:
		logger.Fatal("not support other engine")
		os.Exit(-1)
	}
	return nil
}
