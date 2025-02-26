package handler

import (
	"server/internal/door/services/dto"
)

const (
	SourceMB  = "taobao"
	SourcePDD = "pdd"
)

type ParseDoor interface {
	ParseDoorInfo(doorInfoMap *map[string]interface{}) *dto.DoorSkuDTO
}

func NewParseDoor(source string) ParseDoor {
	switch source {
	case SourceMB:
		return &MBParse{}
	case SourcePDD:
		return &PDDParse{}
	}
	return nil
}

// ParseDoorInfo 解析商品信息
func ParseDoorInfo(source string, doorInfoMap *map[string]interface{}) *dto.DoorSkuDTO {
	parseDoor := NewParseDoor(source)
	if parseDoor == nil {
		return nil
	}
	return parseDoor.ParseDoorInfo(doorInfoMap)
}
