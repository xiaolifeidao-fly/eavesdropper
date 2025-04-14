package oss

import (
	"fmt"
	"testing"
)

func buildQiniuyunOss() *QiniuyunOss {
	qiniuyunOss, _ := NewQiniuyun(&OssEntity{
		DirPrefix:       "",
		BucketName:      "eavesdropper",
		AccessKeyId:     "95VZaM-GRoprzRlVrcdwnaNPwdQZjHLTtE1qGEKU",
		AccessKeySecret: "zHemAnLbTMs-unJmoEFDuVmw-uo1ODMgE10AB5ad",
	})

	return qiniuyunOss
}

func TestQiniuyunOss_BuildUpToken(t *testing.T) {
	qiniuyunOss := buildQiniuyunOss()
	upToken, err := qiniuyunOss.BuildUpToken()
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(upToken)
}

func TestQiniuyunOss_Put(t *testing.T) {
	qiniuyunOss := buildQiniuyunOss()
	err := qiniuyunOss.Put("test.txt", []byte("test"))
	if err != nil {
		t.Fatal(err)
	}
}

func TestQiniuyunOss_Get(t *testing.T) {
	qiniuyunOss := buildQiniuyunOss()
	data, err := qiniuyunOss.Get("test.txt")
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(string(data))
}
