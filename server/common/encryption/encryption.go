package encryption

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/md5"
	"crypto/rand"
	cryptoRand "crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base64"
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

// 固定数据长度
const fixedDataLength = 64 // 明文数据固定填充到 64 字节

// 填充数据到固定长度
func pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(data, padText...)
}

// 移除填充
func unpad(data []byte) ([]byte, error) {
	length := len(data)
	if length == 0 {
		return nil, errors.New("data is empty")
	}
	padding := int(data[length-1])
	if padding > length || padding <= 0 {
		return nil, errors.New("invalid padding")
	}
	return data[:length-padding], nil
}

// EncryptAES 加密数据
func EncryptAES(data, key []byte) (string, error) {
	if len(key) != 32 {
		return "", errors.New("key must be 32 bytes for AES-256")
	}

	// 填充数据到固定长度
	data = pad(data, fixedDataLength)

	// 创建 AES 块
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// 随机生成 IV
	ciphertext := make([]byte, aes.BlockSize+len(data))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	// 加密
	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(ciphertext[aes.BlockSize:], data)

	// 返回 Base64 编码的密文
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptAES 解密数据
func DecryptAES(encrypted string, key []byte) ([]byte, error) {
	if len(key) != 32 {
		return nil, errors.New("key must be 32 bytes for AES-256")
	}

	// 解码 Base64
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return nil, err
	}

	// 创建 AES 块
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// 验证长度
	if len(ciphertext) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}

	// 提取 IV
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	// 解密
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)

	// 移除填充并返回明文
	return unpad(ciphertext)
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

// HashString 将输入字符串转换为 SHA-256 哈希值的十六进制表示
func HashString(input string) string {
	// 创建一个新的 SHA-256 哈希对象
	hasher := sha256.New()

	// 写入数据
	hasher.Write([]byte(input))

	// 计算哈希值并转换为十六进制字符串
	hashBytes := hasher.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)

	return hashString
}
