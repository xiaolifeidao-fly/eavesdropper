package dto

import (
	"errors"
	"strconv"
)

type AuthTokenResultDTO struct {
	ID              uint64 `json:"id"`
	CreateTime      string `json:"createTime"`
	UpdateTime      string `json:"updateTime"`
	CreateBy        string `json:"createBy"`
	UpdateBy        string `json:"updateBy"`
	Active          bool   `json:"active"`
	UserId          uint64 `json:"userId"`
	AccountID       uint64 `json:"accountId"`
	OrderRecordId   uint64 `json:"orderRecordId"`
	Token           string `json:"token"`
	TBShopName      string `json:"tbShopName"`
	TBShopId        string `json:"tbShopId"`
	Status          string `json:"status"`
	BindTime        string `json:"bindTime"`
	ExpireTime      string `json:"expireTime"`
	TokenCreateTime string `json:"tokenCreateTime"`
	ExpireUnit      string `json:"expireUnit"`  // year month day hour minute 等
	ExpireValue     string `json:"expireValue"` // 过期时间值
}

// ConvertTokenExpireTime 将 ExpireUnit 和 ExpireValue
func (dto *AuthTokenResultDTO) ConvertTokenExpireTimeSecond() (int, error) {
	// 处理 ExpireUnit 和 ExpireValue 将其转为天
	unit := map[string]int{
		"year":   365 * 24 * 60 * 60,
		"month":  30 * 24 * 60 * 60,
		"day":    1 * 24 * 60 * 60,
		"hour":   1 * 60 * 60,
		"minute": 1 * 60,
	}

	expireUnit, ok := unit[dto.ExpireUnit]
	if !ok {
		return 0, errors.New("过期时间单位错误")
	}

	expireValue, err := strconv.Atoi(dto.ExpireValue)
	if err != nil {
		return 0, errors.New("过期时间值错误")
	}

	return expireUnit * expireValue, nil
}
