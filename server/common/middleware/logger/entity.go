package logger

var Entity = new(LoggerEntity)

// LoggerEntity 日志配置实体
type LoggerEntity struct {
	Encoding   string `json:"encoding"`   // 日志编码, 可选值: json, console, 默认: json
	Level      string `json:"level"`      // 日志级别, 可选值: debug, info, warn, error, dpanic, panic, fatal, 默认: info
	TimeLayout string `json:"timeLayout"` // 时间格式, 默认: 2006-01-02 15:04:05.000
	Name       string `json:"name"`       // 日志名称, 默认: "server"
	Path       string `json:"path"`       // 日志文件路径, 默认: "./logs"
	Cap        int    `json:"cap"`        // 切割文件大小,MB, 默认: 0
}

func (entity *LoggerEntity) Default() {
	if entity.Encoding == "" {
		entity.Encoding = "json"
	}
	if entity.Level == "" {
		entity.Level = "info"
	}
	if entity.TimeLayout == "" {
		entity.TimeLayout = "2006-01-02 15:04:05.000"
	}
	if entity.Name == "" {
		entity.Name = "server"
	}
	if entity.Path == "" {
		entity.Path = "./logs"
	}
}
