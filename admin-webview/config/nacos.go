package config

import (
	"time"

	"github.com/sirupsen/logrus"
	"gopkg.in/yaml.v2"
)

var log = logrus.New()

type NacosConfig struct {
	Nacos NacosInfo
}

func (n *NacosConfig) MustLoadConfig() {
	maxRetries := 3
	retryDelay := time.Second * 5

	for i := 0; i < maxRetries; i++ {
		val, err := nacosTool.GetVal()
		if err != nil {
			log.WithError(err).Warnf("Failed to get config from nacos (attempt %d/%d)", i+1, maxRetries)
			time.Sleep(retryDelay)
			continue
		}

		if val == "" {
			log.Warnf("Empty configuration received from nacos (attempt %d/%d)", i+1, maxRetries)
			time.Sleep(retryDelay)
			continue
		}

		var config map[string]interface{}
		if err := yaml.Unmarshal([]byte(val), &config); err != nil {
			log.WithError(err).Warnf("Failed to unmarshal config (attempt %d/%d)", i+1, maxRetries)
			time.Sleep(retryDelay)
			continue
		}

		log.Info("Configuration loaded successfully")
		return
	}

	log.Fatal("Failed to load configuration after maximum retries")
}
