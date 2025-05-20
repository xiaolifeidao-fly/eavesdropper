package logger

import (
	"os"
	"path/filepath"
	"server/common"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// 自定义日志级别过滤器
type levelFilter struct {
	level zapcore.Level
	exact bool
}

// Enabled 实现 zapcore.LevelEnabler 接口
func (l levelFilter) Enabled(lvl zapcore.Level) bool {
	if l.exact {
		return lvl == l.level
	}
	return lvl >= l.level
}

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
	// 创建主日志文件写入器
	mainWriter := NewFileWriter(
		entity.Path, // 主日志路径
		entity.Cap,  // 切割文件大小,MB
	)

	// 为每个日志级别创建不同的文件写入器
	debugWriter := NewFileWriter(
		filepath.Join(entity.Path, "debug"), // debug日志路径
		entity.Cap,                          // 切割文件大小,MB
	)
	infoWriter := NewFileWriter(
		filepath.Join(entity.Path, "info"), // info日志路径
		entity.Cap,                         // 切割文件大小,MB
	)
	warnWriter := NewFileWriter(
		filepath.Join(entity.Path, "warn"), // warn日志路径
		entity.Cap,                         // 切割文件大小,MB
	)
	errorWriter := NewFileWriter(
		filepath.Join(entity.Path, "error"), // error日志路径
		entity.Cap,                          // 切割文件大小,MB
	)

	// 创建级别过滤器
	debugLevel := levelFilter{level: zapcore.DebugLevel, exact: true}
	infoLevel := levelFilter{level: zapcore.InfoLevel, exact: true}
	warnLevel := levelFilter{level: zapcore.WarnLevel, exact: true}
	errorLevel := levelFilter{level: zapcore.ErrorLevel, exact: false}

	// 创建主日志Core，使用配置中的级别
	mainCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		mainWriter,
		level(entity.Level),
	)

	// 创建单独级别的Core
	// Debug级别的日志只写入debug目录
	debugCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		debugWriter,
		debugLevel,
	)

	// Info级别的日志只写入info目录
	infoCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		infoWriter,
		infoLevel,
	)

	// Warn级别的日志只写入warn目录
	warnCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		warnWriter,
		warnLevel,
	)

	// Error及以上级别的日志写入error目录
	errorCore := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),
		errorWriter,
		errorLevel,
	)

	// 创建不同级别的日志器
	debugLogger := zap.New(debugCore, zap.WithCaller(true))
	infoLogger := zap.New(infoCore, zap.WithCaller(true))
	warnLogger := zap.New(warnCore, zap.WithCaller(true))
	errorLogger := zap.New(errorCore, zap.WithCaller(true))

	// 创建主日志器
	mainLogger := zap.New(mainCore, zap.WithCaller(true))

	// 创建自定义的日志器，同时更新Logger结构体的字段
	customLogger := &Logger{
		logger:      mainLogger,
		debugLogger: debugLogger,
		infoLogger:  infoLogger,
		warnLogger:  warnLogger,
		errorLogger: errorLogger,
		contextFieldsFunc: func() map[string]interface{} {
			traceID := common.GetRequestID()
			return map[string]interface{}{
				"traceID": traceID,
			}
		},
	}

	// 设置全局日志器
	logger = customLogger

	return zapcore.NewTee(mainCore, debugCore, infoCore, warnCore, errorCore)
}

// 修改level函数，使其返回一个zapcore.LevelEnabler
func level(level string) zapcore.LevelEnabler {
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
