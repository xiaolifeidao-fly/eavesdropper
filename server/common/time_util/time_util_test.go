package timeutil

import (
	"fmt"
	"testing"
	"time"
)

func TestAddDays(t *testing.T) {
	nowTime := time.Now()
	time2 := AddDays(nowTime, 30)
	fmt.Printf("result is [%v]\n", FormatTimeYYYYMMDD_HHMMSS(time2))
}
