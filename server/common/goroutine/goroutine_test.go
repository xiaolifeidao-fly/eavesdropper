package goroutine

import (
	"fmt"
	"testing"
)

func TestGoroutineID(t *testing.T) {
	fmt.Printf("Goroutine ID: %d\n", GetGoroutineID())
}
