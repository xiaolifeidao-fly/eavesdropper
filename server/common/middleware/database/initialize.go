package database

import (
	// "log"
	"time"

	"server/common"
	"server/library/database"
	gormLogger "server/library/database/gorm/logger"
	log "server/library/logger"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DatabaseConfig = new(Database)
var DatabasesConfig = make(map[string]*Database)

// Database 数据库配置
type Database struct {
	// Driver 数据库类型:mysql
	Driver string `json:"driver"`
	// Source 数据库连接字符串mysql缺省信息 charset=utf8&parseTime=True&loc=Local&timeout=1000ms
	Source string `json:"source"`
	// ConnMaxIdleTime 连接最大空闲时间
	ConnMaxIdleTime int `json:"conn-max-idle-time"`
	// ConnMaxLifeTime 连接最大生命周期
	ConnMaxLifeTime int `json:"conn-max-life-time"`
	// MaxIdleConns 最大空闲连接数
	MaxIdleConns int `json:"max-idle-conns"`
	// MaxOpenConns 最大打开连接数
	MaxOpenConns int `json:"max-open-conns"`
}

func multiDatabase() {
	if len(DatabasesConfig) == 0 {
		DatabasesConfig = map[string]*Database{
			"*": DatabaseConfig,
		}
	}
}

// Setup 初始化数据库
func Setup() {
	// 多数据库配置
	multiDatabase()

	for k, config := range DatabasesConfig {
		db, err := SimpleSetupDatabase(k, config)
		if err != nil {
			log.Errorf("%s connect error :%s", k, err)
		}

		common.Runtime.SetDb(k, db)
		log.Infof("%s connect success !", k)
	}
}

func SimpleSetupDatabase(host string, c *Database) (*gorm.DB, error) {
	log.Infof("%s => %s", host, c.Source)

	// 初始化数据库配置
	configure := database.NewDBConfig(
		c.Source,
		c.MaxIdleConns,
		c.MaxOpenConns,
		c.ConnMaxIdleTime,
		c.ConnMaxLifeTime,
	)

	// 初始化 gorm 配置
	gormConfig := &gorm.Config{}
	gormConfig.Logger = gormLogger.New(
		logger.Config{
			SlowThreshold: time.Second,
			Colorful:      true,
			LogLevel:      logger.LogLevel(log.DefaultLogger.Options().Level.LevelForGorm()),
		},
	)

	db, err := configure.Init(c.Driver, gormConfig)
	if err != nil {
		return nil, err
	}
	return db, nil
}
