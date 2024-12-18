package config

import (
	"server/common/middleware/application"
	"server/common/middleware/cache"
	"server/common/middleware/database"
	"server/common/middleware/jwtauth"
	"server/common/middleware/logger"

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
	Application *application.Application       `json:"application"`
	Logger      *logger.Looger                 `json:"logger"`
	Database    *database.Database             `json:"database"`
	Databases   *map[string]*database.Database `json:"databases"`
	JwtAuth     *jwtauth.JwtAuthConfig         `json:"jwt-auth"`
	Cache       *cache.Cache                   `json:"cache"`
}

// Setup 初始化配置
// @param configPath 配置文件路径
func Setup(configPath string) error {
	var err error
	_entity = &Entity{
		Config: &Config{
			Application: application.ApplicationConfig,
			Logger:      logger.LoggerEntity,
			Database:    database.DatabaseConfig,
			Databases:   &database.DatabasesConfig,
			JwtAuth:     jwtauth.JwtauthConfig,
			Cache:       cache.CacheConfig,
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
