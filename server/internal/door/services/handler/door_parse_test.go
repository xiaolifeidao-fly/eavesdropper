package handler

import (
	"encoding/json"
	"fmt"
	"os"
	"server/internal/door/services/dto"
	"testing"
)

func TestDoorInfoParse(t *testing.T) {
	// 读取文件
	doorInfoJson, _ := os.ReadFile("door_info.json")

	doorSkuDTO := &dto.DoorSkuDTO{}
	doorInfoMap := MBParseDoorInfo(string(doorInfoJson), doorSkuDTO)

	doorInfoMapJson, _ := json.Marshal(doorInfoMap)
	json.Unmarshal(doorInfoMapJson, doorSkuDTO)

	fmt.Println(doorSkuDTO)
}
