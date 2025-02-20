package timeutil

import "time"

const (
	YYYYMMDD_HHMMSS = "2006-01-02 15:04:05" // 年月日时分秒
	YYYYMMDD        = "2006-01-02"          // 年月日
	HHMMSS          = "15:04:05"            // 时分秒
	YYYYMMDD_HHMM   = "2006-01-02 15:04"    // 年月日时分
)

// 获取当前时间的字符串表示（默认格式：2006-01-02 15:04:05）
func Now() string {
	return time.Now().Format(YYYYMMDD_HHMMSS)
}

// 将时间戳转换为时间字符串
func TimestampToStr(timestamp int64) string {
	return time.Unix(timestamp, 0).Format(YYYYMMDD_HHMMSS)
}

// 格式化时间为指定格式的字符串
func FormatTimeYYYYMMDD_HHMMSS(t time.Time) string {
	return t.Format(YYYYMMDD_HHMMSS)
}

// 格式化时间为指定格式的字符串
func FormatTime(t time.Time, layout string) string {
	return t.Format(layout)
}

// 增加指定天数
func AddDays(t time.Time, days int) time.Time {
	return t.AddDate(0, 0, days)
}

// 减少指定天数
func SubDays(t time.Time, days int) time.Time {
	return t.AddDate(0, 0, -days)
}

// 判断时间是否在某个范围内
func IsTimeInRange(t, start, end time.Time) bool {
	return t.After(start) && t.Before(end)
}

// 将时分秒设置成0
func ZeroTime(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

func IsAfter(t1, t2 time.Time) bool {
	return t1.After(t2)
}

func IsBefore(t1, t2 time.Time) bool {
	return t1.Before(t2)
}
