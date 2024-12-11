package vipper

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

// Init 初始化配置文件
func init() {
	Init()
}

func Init() {
	viper.SetConfigName("application")
	viper.SetConfigType("properties")
	viper.AddConfigPath("../configs")
	err := viper.ReadInConfig()
	if err != nil {
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}
}

func GetString(key string) string {
	return viper.GetString(key)
}

func GetBool(key string) bool {
	return viper.GetBool(key)
}

func GetInt(key string) int {
	return viper.GetInt(key)
}

func GetStringMap(key string) map[string]interface{} {
	return viper.GetStringMap(key)
}

func GetStringMapString(key string) map[string]string {
	return viper.GetStringMapString(key)
}

func GetStringSlice(key string) []string {
	return viper.GetStringSlice(key)
}

func GetIntSlice(key string) []int {
	return viper.GetIntSlice(key)
}

func GetFloat64(key string) float64 {
	return viper.GetFloat64(key)
}

func GetDuration(key string) time.Duration {
	return viper.GetDuration(key)
}

func GetTime(key string) time.Time {
	return viper.GetTime(key)
}

func GetInt64(key string) int64 {
	return viper.GetInt64(key)
}

func GetUint(key string) uint {
	return viper.GetUint(key)
}

func GetUint64(key string) uint64 {
	return viper.GetUint64(key)
}

func GetStringMapStringSlice(key string) map[string][]string {
	return viper.GetStringMapStringSlice(key)
}
