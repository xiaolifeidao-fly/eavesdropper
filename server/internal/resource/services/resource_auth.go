package services

import (
	"server/common/base"
	timeutil "server/common/time_util"
	"time"
)

func GetResourceAuthExpirationDate(userID uint64) (base.Time, error) {
	nowTime := time.Now()
	expirationDate := timeutil.ZeroTime(timeutil.AddDays(nowTime, 31))
	return base.Time(expirationDate), nil
}
