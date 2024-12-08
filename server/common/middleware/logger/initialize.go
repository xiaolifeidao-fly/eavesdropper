package logger

import (
	"io"
	"os"

	"server/library/logger"
	"server/library/logger/debug/writer"
	"server/library/plugins/zap"
)

var LoggerEntity = new(Looger)

type Looger struct {
	LogName string `json:"log-name"` // 日志前缀名称
	Level   string `json:"level"`    // 日志等级
	Driver  string `json:"driver"`   // 分割引擎
	Stdout  string `json:"stdout"`   // 日志输出模式
	Path    string `json:"path"`     // 日志输出文件路径
	Cap     uint   `json:"cap"`      // 日志文件分割大小
}

func (l *Looger) Setup() {
	Setup(
		WithName(l.LogName),
		WithLevel(l.Level),
		WithDriver(l.Driver),
		WithStdout(l.Stdout),
		WithPath(l.Path),
		WithCap(l.Cap),
	)
}

// Setup 初始化日志
func Setup(opts ...Option) logger.Logger {
	op := setDefault()
	for _, o := range opts {
		o(&op)
	}

	if !pathExist(op.path) {
		err := pathCreate(op.path)
		if err != nil {
			logger.Fatalf("create dir error: %s", err.Error())
		}
	}

	var err error
	outputs := make([]io.Writer, 0)
	switch op.stdout {
	case "file":
		var output io.Writer
		output, err = writer.NewFileWriter(
			writer.WithPath(op.path),
			writer.WithCap(op.cap<<10),
		)
		if err != nil {
			logger.Fatalf("logger setup error: ", err.Error())
		}
		outputs = append(outputs, output)
	}
	outputs = append(outputs, os.Stdout)

	var level logger.Level
	level, err = logger.GetLevel(op.level)
	if err != nil {
		logger.Fatalf("get logger level error, %s", err.Error())
	}

	switch op.driver {
	case "zap":
		logger.DefaultLogger, err = zap.NewLogger(
			logger.WithLevel(level),
			logger.WithName(op.name),
			zap.WithOutput(outputs),
			zap.WithCallerSkip(2),
		)
		if err != nil {
			logger.Fatalf("new zap logger error, %s", err.Error())
		}
	default:
		logger.DefaultLogger = logger.NewLogger(logger.WithLevel(level), logger.WithOutput(outputs))
	}
	return logger.DefaultLogger
}

// pathExist 判断目录是否存在
func pathExist(addr string) bool {
	s, err := os.Stat(addr)
	if err != nil {
		return false
	}
	return s.IsDir()
}

// pathCreate 创建目录
func pathCreate(dir string) error {
	return os.MkdirAll(dir, os.ModePerm)
}
