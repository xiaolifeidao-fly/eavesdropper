package environment

import (
	"fmt"
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/dbresolver"
	"server-zero/config"
	"time"
)

type ServiceContext struct {
	Config  *config.Config
	DbEngin *gorm.DB
	Redis   *redis.Redis
	Svc     *SvcEnv
	Domain  *DomainEnv
}

func NewServiceContext(c *config.Config) *ServiceContext {
	//config.Global = c
	sc := &ServiceContext{Config: c}
	sc.DbEngin = initMysql(c.MySQLConf.TaoTaoDB, c.MySQLConf.TaoTaoDBReadOnly)
	sc.Redis = redis.MustNewRedis(c.RedisConf)
	sc.Svc = NewSvc(sc.Redis, sc.DbEngin, *c)
	sc.Domain = NewDomainEnv(sc.DbEngin)
	return sc
}

func initMysql(m config.DatabaseST, r config.DatabaseST) *gorm.DB {
	mysqlConn := sqlConnStr(m)
	readOnly := sqlConnStr(r)
	logx.Infow("SqlConn initMysql", logx.Field("mysqlConn", mysqlConn), logx.Field("readOnly", readOnly))
	db, err := gorm.Open(mysql.Open(mysqlConn), &gorm.Config{
		Logger: &NothingGormLogger{
			SlowThreshold: time.Second * 2, // 慢 SQL 阈值
			LogLevel:      logger.Warn,     // 日志级别
		},
	})
	//如果出错就GameOver了
	if err != nil {
		logx.Errorw("gorm.Open", logx.Field("mySqlConn", mysqlConn), logx.Field("err", err))
		panic("init mysql error")
	}
	if readOnly != "" {
		err = db.Use(dbresolver.Register(dbresolver.Config{
			Sources:  []gorm.Dialector{mysql.Open(mysqlConn)},
			Replicas: []gorm.Dialector{mysql.Open(readOnly)},
		}))
		if err != nil {
			logx.Errorw("gorm.Open Load Slave Err", logx.Field("mySqlConn", mysqlConn), logx.Field("err", err))
			panic("gorm.Open Load Slave Err")
		}
	}
	return db
}

func sqlConnStr(mysqlConn config.DatabaseST) string {
	if mysqlConn.Host == "" {
		return ""
	}
	c := config.Global
	username := mysqlConn.Username
	password := mysqlConn.Password
	mySQLConn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		username,
		password,
		c.MySQLConf.TaoTaoDB.Host,
		c.MySQLConf.TaoTaoDB.Port,
		c.MySQLConf.TaoTaoDB.DbName,
	)
	return mySQLConn
}
