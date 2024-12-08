package config

import (
	"log"
	"testing"
)

type TestEntity struct {
	Config struct {
		Application struct {
			Mode string `json:"mode"`
		} `json:"application"`
	}
}

func (e *TestEntity) OnChange() {

}

func TestNewConfig(t *testing.T) {
	var _cfg TestEntity

	_, err := NewConfig(
		WithSource("../../config/config.yaml"),
		WithEntity(&_cfg),
	)

	if err != nil {
		log.Fatalln(err)
	}

	log.Println(_cfg.Config.Application.Mode)
}

func TestConfig2(t *testing.T) {

}
