package handler

import (
	"encoding/json"
	"regexp"
	"server/common/extractor"
	"server/internal/door/services/dto"
	"strings"
)

// MBParseDoorInfo 解析商品信息
func MBParseDoorInfo(doorInfo string, doorInfoDTO *dto.DoorSkuDTO) *dto.DoorSkuDTO {
	// 解析信息, 可以直接取的信息
	doorInfoRule := doorInfoDTO.ToExtractorRule() // 获取提取规则
	doorInfoValueMap := extractor.ResolveJSON(doorInfo, doorInfoRule)

	doorSkuSaleInfoValueMap := doorInfoValueMap["doorSkuSaleInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuSaleInfo"] = mbParseDoorSkuSaleInfo(doorSkuSaleInfoValueMap)

	// 图文信息特俗处理, 需要通过正则表达式提取的信息
	doorSkuImageInfoMap := doorInfoValueMap["doorSkuImageInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuImageInfo"] = mbParseDoorSkuImageInfo(doorSkuImageInfoMap)

	doorInfoMapJson, _ := json.Marshal(doorInfoValueMap)
	json.Unmarshal(doorInfoMapJson, doorInfoDTO)

	doorInfoDTO.SetRequiredDefault()
	return doorInfoDTO
}

func mbParseDoorSkuSaleInfo(doorSkuSaleInfoValueMap map[string]interface{}) map[string]interface{} {
	// 解析销售属性
	mbParseDoorSkuSaleInfoSalesAttrs(doorSkuSaleInfoValueMap)
	mbParseDoorSkuSaleInfoSalesSkus(doorSkuSaleInfoValueMap)
	return doorSkuSaleInfoValueMap
}

func mbParseDoorSkuSaleInfoSalesAttrs(doorSkuSaleInfoValueMap map[string]interface{}) {
	var ok bool

	salesAttr := map[string]interface{}{}
	salesAttrValuesInterfaces, ok := doorSkuSaleInfoValueMap["salesAttr"].([]interface{})
	if !ok {
		return
	}

	salesAttrValues := []map[string]interface{}{}
	for _, salesAttrValueInterface := range salesAttrValuesInterfaces {
		salesAttrValue, ok := salesAttrValueInterface.(map[string]interface{})
		if !ok {
			continue
		}
		salesAttrValues = append(salesAttrValues, salesAttrValue)
	}

	if len(salesAttrValues) == 0 {
		return
	}

	for _, salesAttrValueMap := range salesAttrValues {
		pid := salesAttrValueMap["pid"].(string)

		var propsValues []map[string]interface{}
		propsValueInterfaces, ok := salesAttrValueMap["values"].([]interface{})
		if !ok {
			continue
		}
		for _, propsValueInterface := range propsValueInterfaces {
			propsValue := propsValueInterface.(map[string]interface{})
			propsValues = append(propsValues, propsValue)
		}

		if len(propsValues) == 0 {
			continue
		}

		salesAttrValue := map[string]interface{}{}
		salesAttrValue["label"] = salesAttrValueMap["name"]

		salesAttrValues := []map[string]interface{}{}
		for _, propsValue := range propsValues {
			salesAttrValue := map[string]interface{}{
				"text":  propsValue["name"],
				"value": propsValue["vid"],
			}
			salesAttrValues = append(salesAttrValues, salesAttrValue)
		}
		salesAttrValue["values"] = salesAttrValues
		salesAttr["p-"+pid] = salesAttrValue
	}
	doorSkuSaleInfoValueMap["salesAttr"] = salesAttr
}

func mbParseDoorSkuSaleInfoSalesSkus(doorSkuSaleInfoValueMap map[string]interface{}) {
	var ok bool

	salesSkus2Values, ok := doorSkuSaleInfoValueMap["salesSkus2"].(map[string]interface{})
	if !ok {
		return
	}

	salesSkusValueInterfaces, ok := doorSkuSaleInfoValueMap["salesSkus"].([]interface{})
	if !ok {
		return
	}
	salesSkuValues := []map[string]interface{}{}
	for _, salesSkusValueInterface := range salesSkusValueInterfaces {
		salesSkuValues = append(salesSkuValues, salesSkusValueInterface.(map[string]interface{}))
	}

	salesSkus := []map[string]interface{}{}
	for _, salesSkuValue := range salesSkuValues {
		skuId := salesSkuValue["skuId"].(string)
		salesSkus2ValueInterface, ok := salesSkus2Values[skuId]
		if !ok {
			continue
		}

		salesSkus2Value, ok := salesSkus2ValueInterface.(map[string]interface{})
		if !ok {
			continue
		}

		price, ok := salesSkus2Value["price"].(map[string]interface{})
		if !ok {
			continue
		}

		salesSku := map[string]interface{}{
			"salePropPath": salesSkuValue["propPath"],
			"price":        price["priceText"],
			"quantity":     salesSkus2Value["quantity"],
		}
		salesSkus = append(salesSkus, salesSku)
	}
	doorSkuSaleInfoValueMap["salesSkus"] = salesSkus
}

// 解析商品详情中的图片信息
func mbParseDoorSkuImageInfo(doorSkuImageInfoValeMap map[string]interface{}) map[string]interface{} {
	doorSkuImageInfosHtml := doorSkuImageInfoValeMap["doorSkuImageInfos"].(string)
	if len(doorSkuImageInfosHtml) > 0 {
		doorSkuImageInfosHtml = strings.ReplaceAll(doorSkuImageInfosHtml, "\\", "")
		re := regexp.MustCompile(`<(imgsrc)="([^"]+)"`)
		matches := re.FindAllStringSubmatch(doorSkuImageInfosHtml, -1)

		infoMap := []map[string]interface{}{}
		for _, match := range matches {
			if len(match) > 1 {
				contentType := match[1]
				if contentType == "imgsrc" {
					contentType = "image"
				} else {
					// 错误的类型, 在淘宝发布文字自动转为图片
					continue
				}

				content := match[2]
				doorSkuImageInfo := map[string]interface{}{
					"type":    contentType,
					"content": content,
				}
				infoMap = append(infoMap, doorSkuImageInfo)
			}
		}
		doorSkuImageInfoValeMap["doorSkuImageInfos"] = infoMap
	}
	return doorSkuImageInfoValeMap
}
