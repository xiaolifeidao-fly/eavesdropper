package logger

const (
	defaultName   = "log name"
	defaultLevel  = "trace"
	defaultDriver = "zap"
	defaultPath   = "log"
	defaultStdout = "default"
	defaultCap    = 50 * 1024
)

type Option func(*options)

type options struct {
	// driver
	driver string
	// Name 日志前缀名称
	name string
	// path 日志输出文件路径
	path string
	// level 日志级别,trace, debug, info, warn, error, fatal
	level string
	// stdout 日志输出,file:文件,default:命令行,其他:命令行
	stdout string
	// cap 日志文件分割大小,单位kb
	cap uint
}

func setDefault() options {
	return options{
		name:   defaultName,
		level:  defaultLevel,
		driver: defaultDriver,
		path:   defaultPath,
		stdout: defaultStdout,
		cap:    defaultCap,
	}
}

func WithName(s string) Option {
	return func(o *options) {
		o.name = s
	}
}

func WithDriver(s string) Option {
	return func(o *options) {
		o.driver = s
	}
}

func WithPath(s string) Option {
	return func(o *options) {
		o.path = s
	}
}

func WithLevel(s string) Option {
	return func(o *options) {
		o.level = s
	}
}

func WithStdout(s string) Option {
	return func(o *options) {
		o.stdout = s
	}
}

func WithCap(n uint) Option {
	return func(o *options) {
		o.cap = n
	}
}
