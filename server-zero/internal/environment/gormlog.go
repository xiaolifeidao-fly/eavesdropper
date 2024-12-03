package environment

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"github.com/zeromicro/go-zero/core/logc"
	"github.com/zeromicro/go-zero/core/logx"
	"gorm.io/gorm/logger"
	"strings"
	"time"
)

type NothingGormLogger struct {
	LogLevel      logger.LogLevel
	SlowThreshold time.Duration
}

func (l *NothingGormLogger) LogMode(level logger.LogLevel) logger.Interface {
	l.LogLevel = level
	return l
}

func (l *NothingGormLogger) Info(ctx context.Context, format string, v ...interface{}) {
	if l.LogLevel >= logger.Info {
		logc.Infof(ctx, format, v...)
	}
}

func (l *NothingGormLogger) Warn(ctx context.Context, format string, v ...interface{}) {
	if l.LogLevel >= logger.Warn {
		logc.Errorf(ctx, format, v...)
	}
}

func (l *NothingGormLogger) Error(ctx context.Context, format string, v ...interface{}) {
	if l.LogLevel >= logger.Error {
		logc.Errorf(ctx, format, v...)
	}
}

func (l *NothingGormLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	if l.LogLevel <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()
	fields := []logx.LogField{
		{Key: "rows affected", Value: rows},
		{Key: "sql", Value: sql},
		{Key: "cost", Value: fmt.Sprintf("%.3fms", float64(elapsed.Nanoseconds()/1e6))},
	}
	logtrace := logx.WithContext(ctx).WithFields(fields...)

	switch {
	case err != nil && l.LogLevel >= logger.Error && (!errors.Is(err, logger.ErrRecordNotFound)):
		// 如果 err中包含 converting NULL to float64 is unsupported 则不打印日志
		if strings.Contains(err.Error(), "converting NULL to float64 is unsupported") {
			return
		}
		logtrace.Error(err)
	case elapsed > l.SlowThreshold && l.SlowThreshold != 0 && l.LogLevel >= logger.Warn:
		logtrace.Slow(fmt.Sprintf("SLOW SQL >= %v", l.SlowThreshold))
	case l.LogLevel == logger.Info:
		logtrace.Info("success")
	}
}
