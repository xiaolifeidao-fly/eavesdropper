package config

import (
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest"
)

var Global *Config

type DatabaseST struct {
	Username string
	Password string
	Host     string
	Port     string
	DbName   string
}

type Config struct {
	rest.RestConf
	//MySQLConf struct {
	//	TaoTaoDB         DatabaseST
	//	TaoTaoDBReadOnly DatabaseST `json:",optional"`
	//}
	//RedisConf redis.RedisConf
	LogConf logx.LogConf
	XhsSvc  struct {
		Host string
	}
}
