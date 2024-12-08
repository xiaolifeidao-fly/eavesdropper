package common

import (
	"server/common"
	"server/library/logger"
)

// GetRequestLogger 获取requestLogger
func GetRequestLogger() *logger.Helper {
	gContext := common.GetContext()

	l, ok := gContext.GetAny(LoggerKey)
	if !ok {
		return nil
	}

	logger, ok := l.(*logger.Helper)
	if !ok {
		return nil
	}
	return logger
}
