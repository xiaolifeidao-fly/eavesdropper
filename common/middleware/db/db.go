package db

import (
	"galactus/common/middleware/vipper"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Db 定义数据库全局变量
var Db *gorm.DB = GetDataBase()

func GetDataBase() *gorm.DB {
	sqlcon := vipper.GetString("sqlconn")
	// 构建连接："用户名:密码@tcp(IP:端口)/数据库?charset=utf8"
	log.Println("sql连接地址:", sqlcon)
	// slowLogger := logger.New(
	// 	//将标准输出作为Writer
	// 	log.New(os.Stdout, "\r\n", log.LstdFlags),

	// 	logger.Config{
	// 		//设定慢查询时间阈值为1ms
	// 		SlowThreshold: 500 * time.Microsecond,
	// 		//设置日志级别，只有Warn和Info级别会输出慢查询日志
	// 		LogLevel: logger.Info,
	// 	},
	// )

	// 打开数据库,前者是驱动名，所以要导入： _ "github.com/go-sql-driver/mysql"
	DB, err := gorm.Open(mysql.Open(sqlcon), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true, //禁用物理外键
		Logger:                                   logger.Default.LogMode(logger.Error),
	})
	if err != nil {
		log.Fatal("连接失败！")
		return nil
	}
	sqlDB, _ := DB.DB()
	// 设置数据库最大连接数
	sqlDB.SetMaxOpenConns(500)
	// 设置数据库最大闲置数
	sqlDB.SetMaxIdleConns(20)
	// 全局禁用表名复数
	//sqlDB.SingularTable(true)
	// 调试模式，可以打印sql语句
	//sqlDB.LogMode(true)
	return DB
}
