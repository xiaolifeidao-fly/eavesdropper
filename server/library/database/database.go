package database

import (
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/plugin/dbresolver"
)

type DBConfig struct {
	dsn             string // 数据库连接字符串
	connMaxIdleTime int    // 连接最大空闲时间
	connMaxLifetime int    // 连接最大生命周期
	maxIdleConns    int    // 最大空闲连接数
	maxOpenConns    int    // 最大打开连接数
}

func (c *DBConfig) Init(dirver string, config *gorm.Config) (*gorm.DB, error) {
	if config == nil {
		config = &gorm.Config{}
	}

	openFunc, ok := opens[dirver]
	if !ok {
		return nil, fmt.Errorf("driver %s not supported", dirver)
	}

	db, err := gorm.Open(openFunc(c.dsn), config)
	if err != nil {
		return nil, err
	}

	var register *dbresolver.DBResolver
	register = dbresolver.Register(dbresolver.Config{})
	if c.connMaxIdleTime > 0 {
		register = register.SetConnMaxIdleTime(time.Duration(c.connMaxIdleTime) * time.Second)
	}
	if c.connMaxLifetime > 0 {
		register = register.SetConnMaxLifetime(time.Duration(c.connMaxLifetime) * time.Second)
	}
	if c.maxOpenConns > 0 {
		register = register.SetMaxOpenConns(c.maxOpenConns)
	}
	if c.maxIdleConns > 0 {
		register = register.SetMaxIdleConns(c.maxIdleConns)
	}
	if register != nil {
		err = db.Use(register)
	}
	return db, err
}

// NewDBConfig 初始化 DBConfig
func NewDBConfig(dsn string, maxIdleConns, maxOpenConns, connMaxIdleTime, connMaxLifetime int) Configure {
	return &DBConfig{
		dsn:             dsn,
		connMaxIdleTime: connMaxIdleTime,
		connMaxLifetime: connMaxLifetime,
		maxIdleConns:    maxIdleConns,
		maxOpenConns:    maxOpenConns,
	}
}
