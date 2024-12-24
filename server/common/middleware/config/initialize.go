package config

import (
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/middleware/server"
	"server/common/middleware/storage/cache"

	"github.com/spf13/viper"
)

var (
	_entity *Entity
)

type Entity struct {
	Config *Config `json:"config"`
}

// OnChange 配置变更时回调
func (e *Entity) OnChange() {

}

type Config struct {
	Server   *server.ServerEntity     `json:"server"`
	Logger   *logger.LoggerEntity     `json:"logger"`
	Database *database.DatabaseEntity `json:"database"`
	Cache    *cache.CacheEntity       `json:"cache"`
}

// Setup 初始化配置
// @param configPath 配置文件路径
func Setup(configPath string) error {
	var err error
	_entity = &Entity{
		Config: &Config{
			Server:   server.Entity,
			Logger:   logger.Entity,
			Database: database.Config,
			Cache:    cache.Entity,
		},
	}

	viper.SetConfigFile(configPath)
	if err = viper.ReadInConfig(); err != nil {
		return err
	}

	if err = viper.Unmarshal(_entity); err != nil {
		return err
	}

	return nil
}
