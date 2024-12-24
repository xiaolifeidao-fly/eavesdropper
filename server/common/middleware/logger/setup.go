package logger

import (
	"os"
	"server/common"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func Setup(entity *LoggerEntity) {
	if entity == nil {
		panic("logger entity is nil")
	}
	entity.Default() // 设置默认值

	// 创建 Encoder (日志格式)
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.TimeKey = "time"
	encoderConfig.LevelKey = "level"
	encoderConfig.MessageKey = "message"
	encoderConfig.CallerKey = "caller"
	encoderConfig.EncodeTime = zapcore.TimeEncoderOfLayout(entity.TimeLayout) // 时间格式
	encoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder                 // 小写日志级别
	encoderConfig.EncodeCaller = zapcore.ShortCallerEncoder                   // 短路径调用者

	consoleCore := buildConsoleCore(entity, encoderConfig)
	fileCore := buildFileCore(entity, encoderConfig)

	// 创建 Core (控制台输出 + 文件输出)
	core := zapcore.NewTee(consoleCore, fileCore)

	// 构建日志器
	zapLogger := zap.New(core, zap.WithCaller(true), zap.AddCallerSkip(2))

	contextFieldsFunc := func() map[string]interface{} {
		traceID := common.GetRequestID()
		return map[string]interface{}{
			"traceID": traceID,
		}
	}

	logger = &Logger{
		logger:            zapLogger,
		contextFieldsFunc: contextFieldsFunc,
	}
}

func buildConsoleCore(entity *LoggerEntity, encoderConfig zapcore.EncoderConfig) zapcore.Core {
	consoleWriter := zapcore.Lock(zapcore.AddSync(os.Stdout))
	consoleCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig), // 控制台使用 JSON 格式
		consoleWriter,
		level(entity.Level), // 日志级别：Debug 及以上
	)
	return consoleCore
}

func buildFileCore(entity *LoggerEntity, encoderConfig zapcore.EncoderConfig) zapcore.Core {

	writerFile := NewFileWriter(
		entity.Path, // 基础文件路径
		entity.Cap,  // 切割文件大小,MB
	)

	fileCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig), // 文件使用 JSON 格式
		writerFile,
		level(entity.Level), // 日志级别
	)
	return fileCore
}

func level(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	case "dpanic":
		return zapcore.DPanicLevel
	case "panic":
		return zapcore.PanicLevel
	case "fatal":
		return zapcore.FatalLevel
	default:
		return zapcore.InfoLevel
	}
}

// Sync 同步日志
func Sync() {
	logger.logger.Sync()
}

// Debugf 输出调试信息
func Debugf(template string, args ...interface{}) {
	msg := getMessage(template, args)
	logger.Debug(msg, nil)
}

// Infof 输出信息
func Infof(template string, args ...interface{}) {
	msg := getMessage(template, args)
	logger.Info(msg, nil)
}

// Warnf 输出警告
func Warnf(template string, args ...interface{}) {
	msg := getMessage(template, args)
	logger.Warn(msg, nil)
}

// Errorf 输出错误
func Errorf(template string, args ...interface{}) {
	msg := getMessage(template, args)
	logger.Error(msg, nil)
}

// Fatalf 输出致命错误
func Fatalf(template string, args ...interface{}) {
	msg := getMessage(template, args)
	logger.Fatal(msg, nil)
}
