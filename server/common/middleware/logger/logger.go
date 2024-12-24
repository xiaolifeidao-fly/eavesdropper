package logger

import (
	"fmt"

	"go.uber.org/zap"
)

func init() {
	logger = Default()
}

var logger *Logger

// GetLogger 返回一个 Logger
func GetLogger() *Logger {
	return logger
}

// GetGormLogger 返回一个 GormLogger
func GetGormLogger() *Logger {
	gormLogger := logger
	if gormLogger == nil {
		gormLogger = Default()
	}

	zapLogger := gormLogger.logger
	zapLogger = zapLogger.WithOptions(zap.WithCaller(true), zap.AddCallerSkip(2))
	return &Logger{
		logger:            zapLogger,
		contextFieldsFunc: gormLogger.contextFieldsFunc,
	}
}

type Logger struct {
	logger *zap.Logger

	contextFieldsFunc func() map[string]interface{}
}

func Default() *Logger {
	return &Logger{
		logger:            zap.NewExample(),
		contextFieldsFunc: func() map[string]interface{} { return nil },
	}
}

func (l *Logger) Debug(message string, fields map[string]interface{}) {
	fields = l.buildFields(fields)
	l.logger.Debug(message, l.WithFields(fields)...)
}

func (l *Logger) Info(message string, fields map[string]interface{}) {
	fields = l.buildFields(fields)
	l.logger.Info(message, l.WithFields(fields)...)
}

func (l *Logger) Warn(message string, fields map[string]interface{}) {
	fields = l.buildFields(fields)
	l.logger.Warn(message, l.WithFields(fields)...)
}

func (l *Logger) Error(message string, fields map[string]interface{}) {
	fields = l.buildFields(fields)
	l.logger.Error(message, l.WithFields(fields)...)
}

func (l *Logger) Fatal(message string, fields map[string]interface{}) {
	fields = l.buildFields(fields)
	l.logger.Fatal(message, l.WithFields(fields)...)
}

func (l *Logger) buildFields(fields map[string]interface{}) map[string]interface{} {
	if l == nil {
		return fields
	}
	contextFields := l.contextFieldsFunc()
	if contextFields == nil {
		contextFields = make(map[string]interface{})
	}
	for k, v := range fields {
		contextFields[k] = v
	}
	return contextFields
}

func (l *Logger) WithFields(fields map[string]interface{}) []zap.Field {
	zapFields := make([]zap.Field, 0, len(fields))
	for k, v := range fields {
		zapFields = append(zapFields, zap.Any(k, v))
	}
	return zapFields
}

// getMessage format with Sprint, Sprintf, or neither.
func getMessage(template string, fmtArgs []interface{}) string {
	if len(fmtArgs) == 0 {
		return template
	}

	if template != "" {
		return fmt.Sprintf(template, fmtArgs...)
	}

	if len(fmtArgs) == 1 {
		if str, ok := fmtArgs[0].(string); ok {
			return str
		}
	}
	return fmt.Sprint(fmtArgs...)
}
