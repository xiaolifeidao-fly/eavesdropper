package encryption

import (
	cryptoRand "crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
)

// 生成 RSA 密钥对并保存为 PEM 格式
// bits 密钥长度
func GenerateRSAKeys(bits int) (string, string, error) {
	// 生成私钥
	privateKey, err := rsa.GenerateKey(cryptoRand.Reader, bits)
	if err != nil {
		return "", "", fmt.Errorf("无法生成私钥: %v", err)
	}

	// 私钥转换为 PEM 格式
	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPem := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	// 提取公钥并转换为 PEM 格式
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return "", "", fmt.Errorf("无法生成公钥: %v", err)
	}

	publicKeyPem := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	return string(privateKeyPem), string(publicKeyPem), nil
}

// EncryptRSA 使用公钥对数据加密
func EncryptRSA(plainText string, publicKeyPem string) (string, error) {
	// 解码 PEM 格式公钥
	block, _ := pem.Decode([]byte(publicKeyPem))
	if block == nil || block.Type != "PUBLIC KEY" {
		return "", fmt.Errorf("无效的公钥 PEM 格式")
	}

	// 解析公钥
	publicInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return "", fmt.Errorf("解析公钥失败: %v", err)
	}

	pubKey, ok := publicInterface.(*rsa.PublicKey)
	if !ok {
		return "", fmt.Errorf("公钥类型错误")
	}

	encryptedBytes, err := rsa.EncryptPKCS1v15(
		cryptoRand.Reader,
		pubKey,
		[]byte(plainText),
	)

	if err != nil {
		return "", fmt.Errorf("加密失败: %v", err)
	}

	// 返回 Base64 编码后的加密结果
	return base64.StdEncoding.EncodeToString(encryptedBytes), nil
}

// DecryptRSA 使用私钥对数据解密
func DecryptRSA(cipherText string, privateKeyPem string) (string, error) {
	// 解码 PEM 格式私钥
	block, _ := pem.Decode([]byte(privateKeyPem))
	if block == nil {
		return "", fmt.Errorf("无效的私钥 PEM 格式")
	}

	// 解析私钥
	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return "", fmt.Errorf("解析私钥失败: %v", err)
	}

	// Base64 解码密文
	cipherBytes, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		return "", fmt.Errorf("Base64 解码失败: %v", err)
	}

	// 使用私钥解密
	decryptedBytes, err := rsa.DecryptPKCS1v15(cryptoRand.Reader, privateKey, cipherBytes)
	if err != nil {
		return "", fmt.Errorf("解密失败: %v", err)
	}

	// 返回解密后的明文
	return string(decryptedBytes), nil
}
