package logger

import (
	"context"
	"fmt"
	"time"

	log "server/common/middleware/logger"

	"gorm.io/gorm/logger"
)

type gormLogger struct {
	logger *log.Logger
	logger.Config
}

func New(level string, slowThreshold time.Duration) logger.Interface {
	return &gormLogger{
		logger: log.GetGormLogger(),
		Config: logger.Config{
			LogLevel:      convertLogLevel(level),
			SlowThreshold: slowThreshold,
		},
	}
}

func (l *gormLogger) LogMode(level logger.LogLevel) logger.Interface {
	newLogger := *l
	newLogger.LogLevel = level // 设置日志级别
	return &newLogger
}

func (l *gormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Info {
		msg := fmt.Sprintf(msg, data...)
		l.logger.Info(msg, nil)
	}
}

func (l *gormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Warn {
		msg := fmt.Sprintf(msg, data...)
		l.logger.Warn(msg, nil)
	}
}

func (l *gormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Error {
		msg := fmt.Sprintf(msg, data...)
		l.logger.Error(msg, nil)
	}
}

func (l *gormLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	if l.LogLevel <= logger.Silent {
		return
	}

	fields := make(map[string]interface{}, 0)
	elapsed := time.Since(begin) // 计算执行时间
	fields["time"] = fmt.Sprintf("%dms", int64(elapsed.Nanoseconds())/1e6)

	sql, rows := fc()
	fields["sql"] = sql
	if rows > 0 {
		fields["rows"] = rows
	}

	switch {
	case err != nil && l.LogLevel >= logger.Error:
		l.logger.Error(err.Error(), fields)
	case l.SlowThreshold != 0 && elapsed > l.SlowThreshold && l.LogLevel >= logger.Warn:
		slowLog := fmt.Sprintf("SLOW SQL >= %vms", l.SlowThreshold)
		l.logger.Warn(slowLog, fields)
	case l.LogLevel == logger.Info:
		l.logger.Debug("", fields)
	}
}

func convertLogLevel(level string) logger.LogLevel {
	switch level {
	case "silent":
		return logger.Silent
	case "error":
		return logger.Error
	case "warn":
		return logger.Warn
	case "info":
		return logger.Info
	}
	return logger.Info
}
