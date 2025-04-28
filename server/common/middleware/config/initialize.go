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

// Get 获取配置
// key 配置key
func Get(key string) any {
	return viper.Get(key)
}

// GetString 获取字符串配置
// key 配置key
func GetString(key string) string {
	return viper.GetString(key)
}

// GetInt 获取整数配置
// key 配置key
func GetInt(key string) int {
	return viper.GetInt(key)
}

// GetBool 获取布尔配置
// key 配置key
func GetBool(key string) bool {
	return viper.GetBool(key)
}

// GetFloat64 获取浮点数配置
// key 配置key
func GetFloat64(key string) float64 {
	return viper.GetFloat64(key)
}
