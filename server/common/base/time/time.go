package time

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"time"
)

func Now() Time {
	return Time(time.Now())
}

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

func (t Time) ToTime() time.Time {
	return time.Time(t)
}

func (t Time) IsZero() bool {
	return time.Time(t).IsZero()
}
