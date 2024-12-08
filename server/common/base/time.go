package base

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"time"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

type Time time.Time

func (t *Time) UnmarshalJSON(data []byte) (err error) {
	if len(data) > 2 && data[0] == '"' {
		now, err := time.ParseInLocation(`"`+TimeFormat+`"`, string(data), time.Local)
		*t = Time(now)
		return err
	}
	return
}

func (t Time) MarshalJSON() ([]byte, error) {
	if time.Time(t).IsZero() {
		return []byte("\"\""), nil
	}
	b := make([]byte, 0, len(TimeFormat)+2)
	b = append(b, '"')
	b = time.Time(t).AppendFormat(b, TimeFormat)
	b = append(b, '"')
	return b, nil
}

func (t Time) String() string {
	return time.Time(t).Format(TimeFormat)
}

// Value insert timestamp into mysql need this function.
func (t Time) Value() (driver.Value, error) {
	if time.Time(t).IsZero() {
		return nil, nil
	}
	return time.Time(t), nil
}

// Scan value of time.Time
func (t *Time) Scan(value interface{}) error {
	timeValue, ok := value.(time.Time)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal time value:", value))
	}
	*t = Time(timeValue)
	return nil
}

// type Time struct {
// 	time time.Time
// // }

// func NewTime(t time.Time) Time {
// 	return Time{time: t}
// }

// func (t *Time) String() string {
// 	return t.time.Format(TimeFormat)
// }

// // MarshalJSON 实现 json.Marshaler 接口
// func (t Time) MarshalJSON() ([]byte, error) {
// 	return []byte(`"` + t.String() + `"`), nil
// }

// // UnmarshalJSON 实现 json.Unmarshaler 接口
// func (t *Time) UnmarshalJSON(data []byte) error {
// 	var timeStr string
// 	err := json.Unmarshal(data, &timeStr)
// 	if err != nil {
// 		return err
// 	}
// 	parsedTime, err := time.Parse(TimeFormat, timeStr)
// 	if err != nil {
// 		return err
// 	}
// 	t.time = parsedTime
// 	return nil
// }

// // Scan 实现 sql.Scanner 接口
// func (t *Time) Scan(value interface{}) error {
// 	switch v := value.(type) {
// 	case time.Time:
// 		t.time = v
// 	case string:
// 		parsedTime, err := time.Parse(TimeFormat, v)
// 		if err != nil {
// 			return err
// 		}
// 		t.time = parsedTime
// 	case nil:
// 		return nil
// 	default:
// 		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *CustomTime", value)
// 	}
// 	return nil
// }

// // Value 实现 driver.Valuer 接口
// func (t *Time) Value() (driver.Value, error) {
// 	if t.time.IsZero() {
// 		return nil, nil
// 	}
// 	return t.time, nil
// }
