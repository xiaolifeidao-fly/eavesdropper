package captcha

import (
	"fmt"
	"testing"

	"github.com/mojocn/base64Captcha"
)

func TestGenerateCaptcha(t *testing.T) {
	param := configJsonBody{
		CaptchaType: "string",
		DriverString: &base64Captcha.DriverString{
			Height: 120,
			Width:  240,
			Length: 4,
			Source: "1234567890",
		},
	}

	id, base64, answer, err := GenerateCaptcha(param)
	if err != nil {
		fmt.Printf("GenerateCaptcha failed: %v", err)
		return
	}
	fmt.Printf("%s", base64)
	fmt.Println(id)
	fmt.Println(answer)
}
