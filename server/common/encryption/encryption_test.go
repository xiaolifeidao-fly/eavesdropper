package encryption

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"
)

func TestMd5(t *testing.T) {
	t.Log(Md5(Md5("admin")))
}

func TestEncryptionPassword(t *testing.T) {
	secret := "dwnqY8"
	password := "katana"

	passwordMd2 := Md5(Md5(password))
	encryptedPassword := Encryption(secret, passwordMd2)

	t.Log(encryptedPassword)
}

func TestEncryptAES(t *testing.T) {
	secret, err := GenerateAESKey()
	if err != nil {
		t.Log(err)
	}
	t.Log(KeyToHexString(secret)) // b4cca6b3c547a17062d01562fbcddb2a3445166d450382660403785a0c6ffeed

	secret = HexStringToBytes("b4cca6b3c547a17062d01562fbcddb2a3445166d450382660403785a0c6ffeed")

	password := "katana"
	encryptedPassword, err := EncryptAES([]byte(password), secret)
	if err != nil {
		t.Log(err)
	}
	t.Log(KeyToHexString(encryptedPassword))

	// 85c4bc78b123f8038dff00480c2cab7edb66f0d81b6318771c42d86cbdb82629ae0f
	encryptedPassword = HexStringToBytes("85c4bc78b123f8038dff00480c2cab7edb66f0d81b6318771c42d86cbdb82629ae0f")

	decryptedPassword, err := DecryptAES(encryptedPassword, secret)
	if err != nil {
		t.Log(err)
	}
	t.Log(string(decryptedPassword))
}

// 加载公钥文件
func loadPrivateKey(path string) (string, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("无法加载公钥: %v", err)
	}
	return string(data), nil
}

func TestGenerateRSAKeys(t *testing.T) {
	var err error
	var privateKeyPem, publicKeyPem string

	privateKeyPem, publicKeyPem, err = GenerateRSAKeys(2048)
	if err != nil {
		t.Log(err)
	}

	// 将密钥保存到文件
	err = os.WriteFile("private_key.pem", []byte(privateKeyPem), 0600)
	if err != nil {
		fmt.Println("无法保存私钥:", err)
		return
	}
	err = os.WriteFile("public_key.pem", []byte(publicKeyPem), 0644)
	if err != nil {
		fmt.Println("无法保存公钥:", err)
		return
	}
}

func TestEncryptRSA(t *testing.T) {
	// 测试加密
	publicKeyPem, _ := loadPrivateKey("public_key.pem")
	encoded, err := EncryptRSA("admin", publicKeyPem)
	if err != nil {
		t.Log(err)
	}
	t.Log(encoded)
}

func TestDecryptRSA(t *testing.T) {

	encoded := "ZXwT9vEVkx/xG9GQM9EibUqUXWSAx7yadTVNuENwWh8i1MBlUIsCn5E0cwzh2fqKDTbkg5J0R1urz8lgY0EsLOI96VNvPVXEDIcz+2UwJrp0nJb8bwrRIr6ZwHBu+SWerhl+rhkCQudVSy/6/+wRIZ3zfZwdgTVArgQWIZ8rOz/XiQbwoJz1ySamBfWeJNoWeiTHWxpEhf8KDwhtjsRLusb1zgRNO/LuUCm//pCIvOsrfgP44PyCOFfB+QfxRnwNM/RBBkCwkcQt9QRQ+RuCnhiG9DroJGrPPb6pIZ6cLy7Yg9fUI/V93QwGKePIkmxqNrlYQYm9MyaSFIkr4RJQbw=="

	// 测试解密
	privateKeyPem, _ := loadPrivateKey("private_key.pem")
	decoded, err := DecryptRSA(encoded, privateKeyPem)
	if err != nil {
		t.Log(err)
	}
	t.Log(decoded)
}
