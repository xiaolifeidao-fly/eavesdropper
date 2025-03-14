package config

import (
	"server/common/middleware/ai"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/middleware/server"
	"server/common/middleware/storage/cache"
	"server/common/middleware/storage/oss"

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
	Oss      *oss.OssEntity           `json:"oss"`
	Ai       *ai.AiEntity             `json:"ai"`
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
			Oss:      oss.Entity,
			Ai:       ai.Entity,
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
