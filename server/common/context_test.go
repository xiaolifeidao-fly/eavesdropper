package common

import (
	"fmt"
	"testing"
)

func TestGetContext(t *testing.T) {
	ctx := GetContext()
	fmt.Println(ctx)
}
