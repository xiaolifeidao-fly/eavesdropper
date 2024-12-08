package jwtauth

import (
	"errors"
	"sync"
	"time"

	"github.com/golang-jwt/jwt"
)

var (
	errMissingSecret = errors.New("密钥不能为空")
	errSigningMethod = errors.New("签名方法无效")
	errClaimsType    = errors.New("claims类型无效")
	errTokenExpired  = errors.New("token已过期")
)

const (
	defaultSigningAlgorithm = "HS256"
	defaultTimeout          = 1 * time.Hour
	defaultKey              = "QWEE@#$!$%^"
)

var jwtAuth *JwtAuth
var once sync.Once

type MapClaims jwt.MapClaims

var JwtauthConfig = new(JwtAuthConfig)

type JwtAuthConfig struct {
	Key     string `json:"key"`
	Timeout int    `json:"timeout"`
}

// GetJwtAuth 获取JwtAuth
func GetJwtAuth() *JwtAuth {
	once.Do(func() {
		timeout := defaultTimeout
		if JwtauthConfig.Timeout > 0 {
			timeout = time.Duration(JwtauthConfig.Timeout) * time.Second
		}

		if JwtauthConfig.Key == "" {
			JwtauthConfig.Key = defaultKey
		}

		var err error
		jwtAuth, err = NewJwtAuth(&JwtAuth{
			Key:      []byte(JwtauthConfig.Key),
			Timeout:  timeout,
			TimeFunc: time.Now,
		})

		if err != nil {
			panic(err)
		}
	})
	return jwtAuth
}

// ParseJwtToken 解析JwtToken
func ParseJwtToken(token string) (interface{}, error) {
	j := GetJwtAuth()
	return j.ParseJwtToken(token)
}

// GenerateJwtToken 生成Jwttoken
func GenerateJwtToken(data interface{}) (string, error) {
	j := GetJwtAuth()
	return j.GenerateJwtToken(data)
}

func GetJwtAuthTimeout() time.Duration {
	j := GetJwtAuth()
	return j.Timeout
}

type JwtAuth struct {

	// Key 用于签名的密钥,必填
	Key []byte

	// 签名算法 - 可能的值有 HS256, HS384, HS512
	// 可选，默认为 HS256。
	SigningAlgorithm string

	// PayloadFunc 添加额外的数据到jwt的payload中
	// PayloadFunc func(interface{}) MapClaims

	// Timeout jwt 令牌的有效期。可选，默认为一小时。
	Timeout time.Duration

	// TimeFunc 提供当前时间。您可以重写它以使用其他时间值。这对于测试很有用，或者如果您的服务器使用的时区与您的令牌不同。
	TimeFunc func() time.Time
}

func NewJwtAuth(j *JwtAuth) (*JwtAuth, error) {
	if err := j.Init(); err != nil {
		return nil, err
	}
	return j, nil
}

// Init 初始化JwtAuth
func (j *JwtAuth) Init() error {

	if j.Key == nil {
		return errMissingSecret
	}

	if j.SigningAlgorithm == "" {
		j.SigningAlgorithm = defaultSigningAlgorithm
	}

	if j.Timeout == time.Duration(0) {
		j.Timeout = time.Duration(defaultTimeout)
	}

	if j.TimeFunc == nil {
		j.TimeFunc = time.Now
	}

	return nil
}

// GenerateJwtToken 生成JwtToken
func (j *JwtAuth) GenerateJwtToken(data interface{}) (string, error) {
	signingMethod := jwt.GetSigningMethod(j.SigningAlgorithm)
	if signingMethod == nil {
		return "", errSigningMethod
	}

	jwtToken := jwt.New(signingMethod)
	claims, ok := jwtToken.Claims.(jwt.MapClaims)
	if !ok {
		return "", errClaimsType
	}

	claims["data"] = data

	expire := j.TimeFunc().Add(j.Timeout)
	claims["exp"] = expire.Unix()
	claims["orig_iat"] = j.TimeFunc().Unix()

	return jwtToken.SignedString(j.Key)
}

// ParseJwtToken 解析JwtToken
func (j *JwtAuth) ParseJwtToken(token string) (interface{}, error) {
	var err error
	var jwtToken *jwt.Token

	if jwtToken, err = jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		signingMethod := jwt.GetSigningMethod(j.SigningAlgorithm)
		if signingMethod != token.Method {
			return nil, errSigningMethod
		}
		return j.Key, nil
	}); err != nil {
		vErr, ok := err.(*jwt.ValidationError)
		if ok && vErr.Errors == jwt.ValidationErrorExpired {
			return nil, errTokenExpired
		}
		return nil, err
	}

	claims, ok := jwtToken.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errClaimsType
	}

	return claims["data"], nil
}
