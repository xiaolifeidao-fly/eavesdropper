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

	var doorInfoMap map[string]interface{}
	json.Unmarshal(doorInfoJson, &doorInfoMap)

	doorSkuDTO := &dto.DoorSkuDTO{}
	doorSkuDTO = ParseDoorInfo("taobao", &doorInfoMap)

	// doorInfoMapJson, _ := json.Marshal(doorInfoMap)
	// json.Unmarshal(doorInfoMapJson, doorSkuDTO)

	fmt.Println(doorSkuDTO)
}

func TestPddDoorInfoParse(t *testing.T) {
	// 读取文件
	doorInfoJson, _ := os.ReadFile("pdd_sku.json")

	var doorInfoMap map[string]interface{}
	json.Unmarshal(doorInfoJson, &doorInfoMap)

	parseDoor := &PDDParse{}
	doorSkuDTO := parseDoor.ParseDoorInfo(&doorInfoMap)
	fmt.Println(doorSkuDTO)
}
