package captcha

import (
	"github.com/mojocn/base64Captcha"
)

// 默认内存存储
var defaultStore = base64Captcha.DefaultMemStore

// configJsonBody json request body.
type configJsonBody struct {
	Id            string
	CaptchaType   string
	VerifyValue   string
	DriverAudio   *base64Captcha.DriverAudio
	DriverString  *base64Captcha.DriverString
	DriverChinese *base64Captcha.DriverChinese
	DriverMath    *base64Captcha.DriverMath
	DriverDigit   *base64Captcha.DriverDigit
}

type Captcha struct {
	CaptchaID   string
	CaptchaImg  string
	CaptchaCode string
}

// GenerateStringCaptcha 生成字符串验证码
func GenerateStringCaptcha() (Captcha, error) {
	param := configJsonBody{
		CaptchaType: "string",
		DriverString: &base64Captcha.DriverString{
			Height: 120,
			Width:  240,
			Length: 4,
			Source: "1234567890",
		},
	}

	var err error
	captcha := Captcha{}
	captcha.CaptchaID, captcha.CaptchaImg, captcha.CaptchaCode, err = GenerateCaptcha(param)
	return captcha, err
}

// GenerateCaptcha 生成验证码
func GenerateCaptcha(param configJsonBody) (string, string, string, error) {
	var err error
	var driver base64Captcha.Driver

	//create base64 encoding captcha
	switch param.CaptchaType {
	case "audio":
		driver = param.DriverAudio
	case "string":
		driver = param.DriverString.ConvertFonts()
	case "math":
		driver = param.DriverMath.ConvertFonts()
	case "chinese":
		driver = param.DriverChinese.ConvertFonts()
	default:
		driver = param.DriverDigit
	}

	c := base64Captcha.NewCaptcha(driver, defaultStore)
	id, b64s, answer, err := c.Generate()
	if err != nil {
		return "", "", "", err
	}

	return id, b64s, answer, nil
}
