package zap

import (
	"context"
	"fmt"
	"io"
	"os"
	"sync"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"server/library/logger"
)

type zaplog struct {
	cfg  zap.Config
	zap  *zap.Logger
	opts logger.Options
	sync.RWMutex
	fields map[string]interface{}
}

func (l *zaplog) Init(opts ...logger.Option) error {
	for _, o := range opts {
		o(&l.opts)
	}

	zapConfig := zap.NewProductionConfig()
	if zconfig, ok := l.opts.Context.Value(configKey{}).(zap.Config); ok {
		zapConfig = zconfig
	}

	if zcconfig, ok := l.opts.Context.Value(encoderConfigKey{}).(zapcore.EncoderConfig); ok {
		zapConfig.EncoderConfig = zcconfig
	}

	writers, ok := l.opts.Context.Value(writerKey{}).([]io.Writer)
	if !ok {
		writers = []io.Writer{os.Stdout}
	}

	skip, ok := l.opts.Context.Value(callerSkipKey{}).(int)
	if !ok || skip < 1 {
		skip = 1
	}

	// Set log Level if not default
	zapConfig.Level = zap.NewAtomicLevel()
	if l.opts.Level != logger.InfoLevel {
		zapConfig.Level.SetLevel(loggerToZapLevel(l.opts.Level))
	}

	ec := getEncoder(l.opts)
	writeSyncers := make([]zapcore.WriteSyncer, 0)
	for _, writer := range writers {
		writeSyncers = append(writeSyncers, zapcore.AddSync(writer))
	}

	logCore := zapcore.NewCore(
		ec,
		zapcore.NewMultiWriteSyncer(writeSyncers...),
		zapConfig.Level,
	)

	log := zap.New(logCore, zap.AddCaller(), zap.AddCallerSkip(skip), zap.AddStacktrace(zap.DPanicLevel))

	// Adding seed fields if exist
	if l.opts.Fields != nil {
		data := []zap.Field{}
		for k, v := range l.opts.Fields {
			data = append(data, zap.Any(k, v))
		}
		log = log.With(data...)
	}

	// Adding namespace
	if namespace, ok := l.opts.Context.Value(namespaceKey{}).(string); ok {
		log = log.With(zap.Namespace(namespace))
	}

	l.cfg = zapConfig
	l.zap = log
	l.fields = make(map[string]interface{})

	return nil
}

func (l *zaplog) Fields(fields map[string]interface{}) logger.Logger {
	l.Lock()
	nfields := make(map[string]interface{}, len(l.fields))
	for k, v := range l.fields {
		nfields[k] = v
	}
	l.Unlock()
	for k, v := range fields {
		nfields[k] = v
	}

	zl := &zaplog{
		cfg:    l.cfg,
		zap:    l.zap,
		opts:   l.opts,
		fields: nfields,
	}

	return zl
}

func (l *zaplog) Error(err error) logger.Logger {
	return l.Fields(map[string]interface{}{"error": err})
}

func (l *zaplog) Log(level logger.Level, args ...interface{}) {
	l.RLock()
	data := make([]zap.Field, 0, len(l.fields))
	for k, v := range l.fields {
		data = append(data, zap.Any(k, v))
	}
	l.RUnlock()

	lvl := loggerToZapLevel(level)
	msg := fmt.Sprint(args...)
	switch lvl {
	case zap.DebugLevel:
		l.zap.Debug(msg, data...)
	case zap.InfoLevel:
		l.zap.Info(msg, data...)
	case zap.WarnLevel:
		l.zap.Warn(msg, data...)
	case zap.ErrorLevel:
		l.zap.Error(msg, data...)
	case zap.FatalLevel:
		l.zap.Fatal(msg, data...)
	}
}

func (l *zaplog) Logf(level logger.Level, format string, args ...interface{}) {
	l.RLock()
	data := make([]zap.Field, 0, len(l.fields))
	for k, v := range l.fields {
		data = append(data, zap.Any(k, v))
	}
	l.RUnlock()

	lvl := loggerToZapLevel(level)
	msg := fmt.Sprintf(format, args...)
	switch lvl {
	case zap.DebugLevel:
		l.zap.Debug(msg, data...)
	case zap.InfoLevel:
		l.zap.Info(msg, data...)
	case zap.WarnLevel:
		l.zap.Warn(msg, data...)
	case zap.ErrorLevel:
		l.zap.Error(msg, data...)
	case zap.FatalLevel:
		l.zap.Fatal(msg, data...)
	}
}

func (l *zaplog) String() string {
	return "zap"
}

func (l *zaplog) Options() logger.Options {
	return l.opts
}

// NewLogger New builds a new logger based on options
func NewLogger(opts ...logger.Option) (logger.Logger, error) {
	// Default options
	options := logger.Options{
		Level:   logger.InfoLevel,
		Fields:  make(map[string]interface{}),
		Out:     []io.Writer{os.Stderr},
		Context: context.Background(),
	}

	l := &zaplog{opts: options}
	if err := l.Init(opts...); err != nil {
		return nil, err
	}

	return l, nil
}

func loggerToZapLevel(level logger.Level) zapcore.Level {
	switch level {
	case logger.TraceLevel, logger.DebugLevel:
		return zap.DebugLevel
	case logger.InfoLevel:
		return zap.InfoLevel
	case logger.WarnLevel:
		return zap.WarnLevel
	case logger.ErrorLevel:
		return zap.ErrorLevel
	case logger.FatalLevel:
		return zap.FatalLevel
	default:
		return zap.InfoLevel
	}
}

// func zapToLoggerLevel(level zapcore.Level) logger.Level {
// 	switch level {
// 	case zap.DebugLevel:
// 		return logger.DebugLevel
// 	case zap.InfoLevel:
// 		return logger.InfoLevel
// 	case zap.WarnLevel:
// 		return logger.WarnLevel
// 	case zap.ErrorLevel:
// 		return logger.ErrorLevel
// 	case zap.FatalLevel:
// 		return logger.FatalLevel
// 	default:
// 		return logger.InfoLevel
// 	}
// }

func getEncoder(options logger.Options) zapcore.Encoder {
	cfg := getEncoderConfig(options)
	return zapcore.NewConsoleEncoder(cfg)
}

func getEncoderConfig(options logger.Options) zapcore.EncoderConfig {
	lineEnding := zapcore.DefaultLineEnding
	encodeLevel := zapcore.CapitalLevelEncoder
	encodeTime := func(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString("[" + options.Name + "] " + t.Format("2006-01-02 15:04:05.000"))
	}
	encodeDuration := zapcore.SecondsDurationEncoder
	encodeCaller := zapcore.ShortCallerEncoder

	return zapcore.EncoderConfig{
		MessageKey:     "message",
		LevelKey:       "level",
		TimeKey:        "time",
		NameKey:        "logger",
		CallerKey:      "caller",
		StacktraceKey:  "S",
		LineEnding:     lineEnding,
		EncodeLevel:    encodeLevel,
		EncodeTime:     encodeTime,
		EncodeDuration: encodeDuration,
		EncodeCaller:   encodeCaller,
	}
}
