package oss

import (
	"bytes"
	"errors"
	"io"
	"time"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

type AliyunOss struct {
	DirPrefix       string
	Endpoint        string
	BucketName      string
	AccessKeyId     string
	AccessKeySecret string

	ossClient *oss.Client
}

func NewAliyun(entity *OssEntity) (*AliyunOss, error) {
	var err error
	var ossClient *oss.Client

	aliyunOss := &AliyunOss{
		DirPrefix:       entity.DirPrefix,
		Endpoint:        entity.Endpoint,
		BucketName:      entity.BucketName,
		AccessKeyId:     entity.AccessKeyId,
		AccessKeySecret: entity.AccessKeySecret,
	}

	if ossClient, err = oss.New(entity.Endpoint, entity.AccessKeyId, entity.AccessKeySecret); err != nil {
		return nil, err
	}

	aliyunOss.ossClient = ossClient
	return aliyunOss, nil
}

func (a *AliyunOss) BuildKey(path string) string {
	if a.DirPrefix == "" {
		return path
	}

	if path[0] == '/' {
		path = path[1:]
	}
	path = a.DirPrefix + "/" + path
	return path
}

func (a *AliyunOss) Put(path string, data []byte) error {
	if len(path) == 0 || len(data) == 0 {
		return errors.New("file path or data is nil")
	}

	var err error
	var bucket *oss.Bucket
	if bucket, err = a.ossClient.Bucket(a.BucketName); err != nil {
		return err
	}

	key := a.BuildKey(path)
	if err = bucket.PutObject(key, bytes.NewReader(data)); err != nil {
		return err
	}
	return nil
}

func (a *AliyunOss) Get(path string) ([]byte, error) {
	if len(path) == 0 {
		return nil, errors.New("file path is nil")
	}

	var err error
	var bucket *oss.Bucket
	if bucket, err = a.ossClient.Bucket(a.BucketName); err != nil {
		return nil, err
	}

	key := a.BuildKey(path)
	var body io.ReadCloser

	if body, err = bucket.GetObject(key); err != nil {
		return nil, err
	}
	defer body.Close()

	buf := new(bytes.Buffer)
	io.Copy(buf, body)
	return buf.Bytes(), nil
}

// 获取有效期的URL
func (a *AliyunOss) GetUrl(path string, duration *time.Duration) (string, error) {
	if len(path) == 0 {
		return "", errors.New("file path is nil")
	}

	if duration == nil {
		duration = new(time.Duration)
		*duration = time.Hour * 1
	}

	var err error
	var bucket *oss.Bucket
	if bucket, err = a.ossClient.Bucket(a.BucketName); err != nil {
		return "", err
	}

	key := a.BuildKey(path)
	var url string

	expiredInSec := int64((*duration).Seconds())
	if url, err = bucket.SignURL(key, oss.HTTPGet, expiredInSec); err != nil {
		return "", err
	}
	return url, nil
}
