package database

import (
	"fmt"
	"time"

	gormLogger "server/common/middleware/database/logger"
	"server/common/middleware/logger"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Setup(entity *DatabaseEntity) {
	if entity == nil {
		panic("database entity is nil")
	}
	entity.Default()

	var err error
	var db *gorm.DB

	dsn := dsn(entity.Username, entity.Password, entity.Host, entity.Port, entity.Database, entity.Source)

	dialect := dialect(entity.Driver, dsn)
	gormLogger := gormLogger.New(entity.LogLevel, time.Duration(entity.SlowLog)*time.Millisecond)

	gormConfig := &gorm.Config{
		Logger: gormLogger,
	}

	if db, err = gorm.Open(dialect, gormConfig); err != nil {
		panic(err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(entity.MaxOpen) // 设置最大连接数
	sqlDB.SetMaxIdleConns(entity.MaxIdle) // 设置最大空闲连接数
	sqlDB.SetConnMaxLifetime(time.Hour)   // 设置连接最大存活时间

	DB = db

	logger.Infof("database %s:%s setup success", entity.Host, entity.Port)

	RepositoryInit(DB) // 初始化仓库
}

func dsn(username, password, host, port, database, source string) string {
	dsnFormat := "%s:%s@tcp(%s:%s)/%s?%s"
	dsn := fmt.Sprintf(dsnFormat, username, password, host, port, database, source)
	return dsn
}

func dialect(driver, dsn string) gorm.Dialector {
	var dialect gorm.Dialector
	switch driver {
	case "mysql":
		dialect = mysql.New(mysql.Config{DSN: dsn})
	default:
		panic(fmt.Sprintf("unsupported driver: %s", driver))
	}
	return dialect
}
