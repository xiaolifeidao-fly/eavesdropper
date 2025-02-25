package oss

import (
	"bytes"
	"errors"
	"io"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

type aliyunOss struct {
	DirPrefix       string
	Endpoint        string
	BucketName      string
	AccessKeyId     string
	AccessKeySecret string

	ossClient *oss.Client
}

func NewAliyun(entity *OssEntity) (*aliyunOss, error) {
	var err error
	var ossClient *oss.Client

	aliyunOss := &aliyunOss{
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

func (a *aliyunOss) BuildKey(path string) string {
	if a.DirPrefix == "" {
		return path
	}

	if path[0] == '/' {
		path = path[1:]
	}
	path = a.DirPrefix + "/" + path
	return path
}

func (a *aliyunOss) Put(path string, data []byte) error {
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

func (a *aliyunOss) Get(path string) ([]byte, error) {
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
	defer body.Close()

	if body, err = bucket.GetObject(key); err != nil {
		return nil, err
	}

	buf := new(bytes.Buffer)
	io.Copy(buf, body)
	return buf.Bytes(), nil
}
