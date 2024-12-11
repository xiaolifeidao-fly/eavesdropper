package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/md5"
	cryptoRand "crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
)

// Md5 生成MD5值
func Md5(s string) string {
	h := md5.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

// Encryption 加密数据
func Encryption(secret, password string) string {
	return sha1String(Hmac(secret, password))
}

func sha1String(s string) string {
	return sha1Byte([]byte(s))
}

func sha1Byte(b []byte) string {
	h := sha1.New()
	h.Write(b)
	return hex.EncodeToString(h.Sum(nil))
}

func Hmac(k, v string) string {
	mac := hmac.New(sha256.New, []byte(k))
	mac.Write([]byte(v))
	return hex.EncodeToString(mac.Sum(nil))
}

// EncryptAES 加密数据
func EncryptAES(data, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// AES-GCM需要一个Nonce
	nonce := make([]byte, 12)
	if _, err := io.ReadFull(cryptoRand.Reader, nonce); err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	encrypted := aesGCM.Seal(nil, nonce, data, nil)

	// 返回初始化向量和加密数据
	result := make([]byte, len(nonce)+len(encrypted))
	copy(result[:len(nonce)], nonce)
	copy(result[len(nonce):], encrypted)
	return result, nil
}

// DecryptAES 解密数据
func DecryptAES(encryptedData []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	if len(encryptedData) < 12 {
		return nil, errors.New("ciphertext too short")
	}

	nonce := encryptedData[:12]
	data := encryptedData[12:]

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	decrypted, err := aesGCM.Open(nil, nonce, data, nil)
	if err != nil {
		return nil, err
	}

	return decrypted, nil
}

// GenerateAESKey 生成AES加密密钥
func GenerateAESKey() ([]byte, error) {
	key := make([]byte, 32) // 256位
	if _, err := io.ReadFull(cryptoRand.Reader, key); err != nil {
		return nil, err
	}
	return key, nil
}

// KeyToHexString 将[]byte数组转为Hex字符
func KeyToHexString(key []byte) string {
	return hex.EncodeToString(key)
}

// HexStringToBytes 将Hex字符转为[]byte数组
func HexStringToBytes(str string) []byte {
	bytes, _ := hex.DecodeString(str)
	return bytes
}
