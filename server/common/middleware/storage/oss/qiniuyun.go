package oss

import (
	"bytes"
	"context"
	"time"

	"github.com/qiniu/go-sdk/v7/storagev2/credentials"
	"github.com/qiniu/go-sdk/v7/storagev2/downloader"
	"github.com/qiniu/go-sdk/v7/storagev2/http_client"
	"github.com/qiniu/go-sdk/v7/storagev2/uploader"
	"github.com/qiniu/go-sdk/v7/storagev2/uptoken"
)

type QiniuyunOss struct {
	DirPrefix string

	BucketName string
	AccessKey  string
	SecretKey  string

	tokenExpireTime time.Duration
}

func NewQiniuyun(entity *OssEntity) (*QiniuyunOss, error) {

	qiniuyunOss := &QiniuyunOss{
		DirPrefix:  entity.DirPrefix,
		BucketName: entity.BucketName,
		AccessKey:  entity.AccessKeyId,
		SecretKey:  entity.AccessKeySecret,
	}

	if entity.TokenExpireTime > 0 {
		qiniuyunOss.tokenExpireTime = time.Duration(entity.TokenExpireTime) * time.Second
	}

	return qiniuyunOss, nil
}

func (q *QiniuyunOss) BuildKey(path string) string {
	if q.DirPrefix == "" {
		return path
	}

	if path[0] == '/' {
		path = path[1:]
	}
	path = q.DirPrefix + "/" + path
	return path
}

// BuildUpToken
// 构建客户端上传凭证
func (q *QiniuyunOss) BuildUpToken() (string, error) {
	mac := credentials.NewCredentials(q.AccessKey, q.SecretKey)

	putPolicy, err := uptoken.NewPutPolicy(q.BucketName, time.Now().Add(q.tokenExpireTime))
	if err != nil {
		return "", err
	}

	upToken, err := uptoken.NewSigner(putPolicy, mac).GetUpToken(context.Background())
	if err != nil {
		return "", err
	}

	return upToken, nil
}

// Put
// 上传文件
func (q *QiniuyunOss) Put(path string, data []byte) error {
	mac := credentials.NewCredentials(q.AccessKey, q.SecretKey)

	uploadManager := uploader.NewUploadManager(&uploader.UploadManagerOptions{
		Options: http_client.Options{
			Credentials: mac,
		},
	})

	var err error
	var reader = bytes.NewReader(data)
	if err = uploadManager.UploadReader(context.Background(), reader, &uploader.ObjectOptions{
		BucketName: q.BucketName,
		ObjectName: &path,
		FileName:   path,
	}, nil); err != nil {
		return err
	}

	return nil
}

// Get
// 获取文件
func (q *QiniuyunOss) Get(path string) ([]byte, error) {
	mac := credentials.NewCredentials(q.AccessKey, q.SecretKey)

	domain := "http://eavesdropper.eaochat.com"
	// urlsProvider := downloader.NewStaticDomainBasedURLsProvider([]string{domain})

	urlsProvider := downloader.SignURLsProvider(downloader.NewStaticDomainBasedURLsProvider([]string{domain}), downloader.NewCredentialsSigner(mac), &downloader.SignOptions{
		TTL: 1 * time.Hour, // 有效期
	})

	var writer = bytes.NewBuffer(nil)
	downloadManager := downloader.NewDownloadManager(&downloader.DownloadManagerOptions{})
	_, err := downloadManager.DownloadToWriter(context.Background(), path, writer, &downloader.ObjectOptions{
		GenerateOptions:      downloader.GenerateOptions{BucketName: q.BucketName},
		DownloadURLsProvider: urlsProvider,
	})
	if err != nil {
		return nil, err
	}

	return writer.Bytes(), nil
}
