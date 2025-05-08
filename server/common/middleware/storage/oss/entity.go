package oss

var Entity = new(OssEntity)

type OssEntity struct {
	DirPrefix       string `json:"dirPrefix"`
	Endpoint        string `json:"endpoint"`
	BucketName      string `json:"bucketName"`
	AccessKeyId     string `json:"accessKeyId"`
	AccessKeySecret string `json:"accessKeySecret"`
	ExpireTime      int64  `json:"expireTime"`
	CallbackUrl     string `json:"callbackUrl"`
	TokenExpireTime int64  `json:"tokenExpireTime"`
}

func (entity *OssEntity) Default() {
	// 默认驱动
	if entity.DirPrefix == "" {
		entity.DirPrefix = "dev"
	}
	if entity.ExpireTime == 0 {
		entity.ExpireTime = 600
	}

	// 默认5分钟
	if entity.TokenExpireTime == 0 {
		entity.TokenExpireTime = 5 * 60
	}
}
