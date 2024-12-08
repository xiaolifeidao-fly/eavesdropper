package common

import (
	"server/library/logger"
)

func GetLogger() *logger.Helper {
	gContext := GetContext()

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
