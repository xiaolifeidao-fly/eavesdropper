package config

import (
	"encoding/json"
	"log"
	"server/common/middleware/logger"
	"testing"
)

func TestSetup(t *testing.T) {
	err := Setup("../../../config/config.yaml")
	if err != nil {
		log.Fatalln("error: ", err)
	}

	values := DefaultConfig.Map()
	bytes, err := json.MarshalIndent(values, "", "  ")
	if err != nil {
		log.Fatalln("error: ", err)
	}
	log.Printf("%s\n", string(bytes))

	// 测试日志配置
	log.Println("logger: ", logger.LoggerEntity.LogName)
}
