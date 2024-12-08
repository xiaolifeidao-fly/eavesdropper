package logger

import (
	"server/library/logger"
	"testing"
	"time"
)

func TestSetupLogger(t *testing.T) {
	l := Setup(
		WithLevel("trace"),
		WithPath("log"),
		WithStdout("file"),
		WithCap(1024),
	)

	h1 := logger.NewHelper(l)

	h1.Infof("count = %v", 1)
	time.Sleep(10 * time.Millisecond)
}
