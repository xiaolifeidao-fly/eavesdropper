package config

import (
	"log"
	"server/library/config/reader"
	"strings"
)

// GetValue 获取配置值
// @param key 配置键
// @return 配置值
func GetValue(key string) reader.Value {
	if DefaultConfig == nil {
		log.Fatalln("config is not initialized")
	}

	kets := strings.Split(key, ".")
	return DefaultConfig.Get(kets...)
}

// GetValueString 获取string配置值
// @param key 配置键
// @return 配置值
func GetValueString(key string) string {
	return GetValue(key).String("")
}

// GetValueString 获取int配置值
// @param key 配置键
// @return 配置值
func GetValueInt(key string) int {
	return GetValue(key).Int(0)
}

// GetValueBool 获取bool配置值
// @param key 配置键
// @return 配置值
func GetValueBool(key string) bool {
	return GetValue(key).Bool(false)
}
