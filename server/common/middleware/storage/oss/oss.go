package oss

import (
	"errors"
	"time"
)

var Oss *AliyunOss

type AdapterOss interface {
	Put(path string, data []byte) error
	Get(path string) ([]byte, error)
	GetUrl(path string, duration *time.Duration) (string, error)
	BuildKey(path string) string
}

func Put(path string, data []byte) error {
	if Oss == nil {
		return errors.New("oss not init")
	}
	return Oss.Put(path, data)
}

func Get(path string) ([]byte, error) {
	if Oss == nil {
		return nil, errors.New("oss not init")
	}
	return Oss.Get(path)
}

func GetUrl(path string, duration *time.Duration) (string, error) {
	if Oss == nil {
		return "", errors.New("oss not init")
	}
	return Oss.GetUrl(path, duration)
}
