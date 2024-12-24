package database

var Config = new(DatabaseEntity)

type DatabaseEntity struct {
	Driver   string `json:"driver"`   // 数据库类型:mysql
	Username string `json:"username"` // 用户名
	Password string `json:"password"` // 密码
	Host     string `json:"host"`     // 主机
	Port     string `json:"port"`     // 端口
	Database string `json:"database"` // 数据库
	Source   string `json:"source"`   // 数据库连接字符串mysql缺省信息 charset=utf8&parseTime=True&loc=Local&timeout=1000ms
	MaxOpen  int    `json:"maxOpen"`  // 最大连接数
	MaxIdle  int    `json:"maxIdle"`  // 最大空闲连接数
	LogLevel string `json:"logLevel"` // 日志级别
	SlowLog  int    `json:"slowLog"`  // 慢查询时间,单位:毫秒
}

func (entity *DatabaseEntity) Default() {
	if entity.Driver == "" {
		entity.Driver = "mysql"
	}
	if entity.Username == "" {
		entity.Username = "root"
	}
	if entity.Password == "" {
		entity.Password = "root"
	}
	if entity.Host == "" {
		entity.Host = "127.0.0.1"
	}
	if entity.Port == "" {
		entity.Port = "3306"
	}
	if entity.Database == "" {
		entity.Database = "test"
	}
	if entity.Source == "" {
		entity.Source = "charset=utf8&parseTime=True&loc=Local&timeout=1000ms"
	}
	if entity.MaxOpen == 0 {
		entity.MaxOpen = 100
	}
	if entity.MaxIdle == 0 {
		entity.MaxIdle = 10
	}
	if entity.LogLevel == "" {
		entity.LogLevel = "info"
	}
	if entity.SlowLog == 0 {
		entity.SlowLog = 200
	}
}
