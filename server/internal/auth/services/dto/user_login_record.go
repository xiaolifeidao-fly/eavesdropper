package dto

import (
	"server/common/base"
	"server/common/base/dto"
)

type UserLoginRecordDTO struct {
	dto.BaseDTO
	UserID        uint64    `json:"userId"`
	LoginTime     base.Time `json:"loginTime"`
	LoginIP       string    `json:"loginIp"`
	LoginDeviceID string    `json:"loginDeviceId"` // 登录设备ID
}
