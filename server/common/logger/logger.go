package logger

import (
	"server/common"
	"server/library/logger"
)

const (
	LoggerKey = common.LoggerKey
)

func GetLogger() *logger.Helper {
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

func Info(args ...interface{}) {
	GetLogger().Info(args...)
}

func Infof(format string, args ...interface{}) {
	GetLogger().Infof(format, args...)
}

func Error(args ...interface{}) {
	GetLogger().Error(args...)
}

func Errorf(format string, args ...interface{}) {
	GetLogger().Errorf(format, args...)
}

func Debug(args ...interface{}) {
	GetLogger().Debug(args...)
}

func Debugf(format string, args ...interface{}) {
	GetLogger().Debugf(format, args...)
}

func Warn(args ...interface{}) {
	GetLogger().Warn(args...)
}

func Warnf(format string, args ...interface{}) {
	GetLogger().Warnf(format, args...)
}
