package oss

import "errors"

var Oss *AliyunOss

type AdapterOss interface {
	Put(path string, data []byte) error
	Get(path string) ([]byte, error)
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
