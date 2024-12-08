package jwtauth

import (
	"testing"
	"time"
)

func TestJwtToken(t *testing.T) {
	var err error
	var j *JwtAuth

	if j, err = NewJwtAuth(&JwtAuth{
		Key:     []byte("1234567890"),
		Timeout: time.Second * 10, // 10秒后过期
	}); err != nil {
		t.Fatalf("创建JwtAuth失败: %v", err)
	}

	loginUser := map[string]interface{}{
		"id":       1,
		"username": "test",
	}

	token, err := j.GenerateJwtToken(loginUser)
	if err != nil {
		t.Fatalf("生成JwtToken失败\n%v", err)
	}

	// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzI4NzE5NTIsIm9yaWdfaWF0IjoxNzMyODY4MzUyfQ.hawRCc4oj6f3NlMzCKrxAhFPBLaM611O8lfc5VxrD94
	// t.Logf("JwtToken: %s", token)

	// time.Sleep(time.Second * 11)

	data, err := j.ParseJwtToken(token)
	if err != nil {
		t.Fatalf("解析JwtToken失败\n%v", err)
	}

	dataMap, ok := data.(map[string]interface{})
	if !ok {
		t.Fatalf("解析JwtToken失败\n%v", err)
	}
	t.Logf("Data: %v", dataMap)
}
