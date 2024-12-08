package encryption

import (
	"testing"
)

func TestMd5(t *testing.T) {
	t.Log(Md5(Md5("admin")))
}
