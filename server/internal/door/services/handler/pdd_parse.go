package handler

import (
	"encoding/json"
	"regexp"
	"server/common/extractor"
	"server/internal/door/services/dto"
	"strconv"
	"strings"
)

type PDDParse struct{}

func (pdd *PDDParse) GetExtractorRule() map[string]interface{} {
	return map[string]interface{}{
		"baseInfo": map[string]interface{}{
			"catId":       "goods.catID",
			"itemId":      "goods.goodsID",
			"title":       "goods.goodsName", // 提取【】之后的内容
			"guideTitle":  "goods.goodsName", // 提取【】之后的内容
			"mainImages":  "goods.viewImageData",
			"skuItemInfo": "goods.goodsProperty",
		},
		"doorSkuSaleInfo": map[string]interface{}{
			"skus":      "goods.skus",
			"price":     "goods.ui.new_price_section.price",
			"reviewNum": "oakData.review.reviewNum",
			"saleNum":   "goods.sideSalesTip",
		},
		"doorSkuLogisticsInfo": map[string]interface{}{
			"deliveryFromAddr": "goods.goodsProperty",
			"isFreeShipping":   "goods.mallService.service",
		},
		"doorSkuImageInfo": map[string]interface{}{
			"doorSkuImageInfos": "goods.detailGallery",
		},
	}
}

func (pdd *PDDParse) ParseDoorInfo(doorInfoMap *map[string]interface{}) *dto.DoorSkuDTO {
	doorInfoDTO := &dto.DoorSkuDTO{}

	// 解析信息, 可以直接取的信息
	doorInfoRule := pdd.GetExtractorRule()
	doorInfoJson, _ := json.Marshal(*doorInfoMap)
	doorInfoValueMap := extractor.ResolveJSON(string(doorInfoJson), doorInfoRule)

	// 解析基础信息
	doorBaseInfo := doorInfoValueMap["baseInfo"].(map[string]interface{})
	doorInfoValueMap["baseInfo"] = pddParseBaseInfo(doorBaseInfo)

	// 解析销售信息
	doorSkuSaleInfo := doorInfoValueMap["doorSkuSaleInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuSaleInfo"] = pddParseDoorSkuSaleInfo(doorSkuSaleInfo)

	// 解析图片信息
	doorSkuImageInfo := doorInfoValueMap["doorSkuImageInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuImageInfo"] = pddParseDoorSkuImageInfo(doorSkuImageInfo)

	// 解析物流信息
	doorSkuLogisticsInfo := doorInfoValueMap["doorSkuLogisticsInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuLogisticsInfo"] = pddParseDoorSkuLogisticsInfo(doorSkuLogisticsInfo)

	doorInfoMapJson, _ := json.Marshal(doorInfoValueMap)
	json.Unmarshal(doorInfoMapJson, doorInfoDTO)

	// 设置必填字段默认值
	doorInfoDTO.SetRequiredDefault(doorInfoValueMap)
	return doorInfoDTO
}

func pddParseBaseInfo(baseInfo map[string]interface{}) map[string]interface{} {

	itemId := baseInfo["itemId"]
	baseInfo["itemId"] = pddParseBaseInfoItemID(itemId)

	title := baseInfo["title"]
	baseInfo["title"] = pddParseBaseInfoTitle(title)
	baseInfo["guideTitle"] = baseInfo["title"]

	catId := baseInfo["catId"]
	baseInfo["catId"] = pddParseBaseInfoItemID(catId)

	skuItemInfo := baseInfo["skuItemInfo"]
	baseInfo["skuItems"] = pddParseBaseInfoSkuItems(skuItemInfo)
	return baseInfo
}

func pddParseBaseInfoItemID(itemIDInterface interface{}) string {
	var ok bool

	var itemId float64
	if itemId, ok = itemIDInterface.(float64); !ok {
		return ""
	}

	return strconv.FormatFloat(itemId, 'f', -1, 64)
}

func pddParseBaseInfoTitle(titleInterface interface{}) string {
	var ok bool

	var title string
	if title, ok = titleInterface.(string); !ok {
		return ""
	}

	sep := "】"
	splits := strings.Split(title, sep)
	if len(splits) > 1 {
		title = splits[len(splits)-1]
	}
	return title
}

func pddParseBaseInfoSkuItems(skuItemInfoInterface interface{}) []*dto.SkuItem {
	var ok bool

	var goodsPropertyInterfaceArray []interface{}
	if goodsPropertyInterfaceArray, ok = skuItemInfoInterface.([]interface{}); !ok {
		return nil
	}

	skuItems := []*dto.SkuItem{}
	for _, goodPropertyInterface := range goodsPropertyInterfaceArray {
		var goodProperty map[string]interface{}
		if goodProperty, ok = goodPropertyInterface.(map[string]interface{}); !ok {
			continue
		}

		skuItem := &dto.SkuItem{}
		skuItem.Title = goodProperty["key"].(string)
		texts := goodProperty["values"].([]interface{})
		skuItem.Text = make([]string, len(texts))
		for i, text := range texts {
			skuItem.Text[i] = text.(string)
		}
		skuItems = append(skuItems, skuItem)
	}
	return skuItems
}

func pddParseDoorSkuSaleInfo(doorSkuSaleInfo map[string]interface{}) map[string]interface{} {

	skusInterfaceArray := doorSkuSaleInfo["skus"].([]interface{})
	skus := pddParseDoorSkuSaleInfoSkus(skusInterfaceArray)
	doorSkuSaleInfo["salesAttr"] = pddParseDoorSkuSaleInfoSalesAttr(skus)
	doorSkuSaleInfo["salesSkus"] = pddParseDoorSkuSaleInfoSalesSkus(skus)
	doorSkuSaleInfo["quantity"] = pddParseDoorSkuSaleInfoQuantity(skus)
	doorSkuSaleInfo["reviewNum"] = pddParseDoorSkuSaleInfoReviewNum(doorSkuSaleInfo["reviewNum"])
	doorSkuSaleInfo["saleNum"] = pddParseDoorSkuSaleInfoSaleNum(doorSkuSaleInfo["saleNum"])

	return doorSkuSaleInfo
}

func pddParseDoorSkuSaleInfoSkus(skusInterface interface{}) []map[string]interface{} {
	var ok bool

	var skusInterfaceArray []interface{}
	if skusInterfaceArray, ok = skusInterface.([]interface{}); !ok {
		return nil
	}

	skus := []map[string]interface{}{}
	for _, skuskuInterface := range skusInterfaceArray {
		var sku map[string]interface{}
		if sku, ok = skuskuInterface.(map[string]interface{}); !ok {
			continue
		}

		skus = append(skus, sku)
	}

	return skus
}

func pddParseDoorSkuSaleInfoSalesAttr(skus []map[string]interface{}) map[string]*dto.SalesAttr {
	if len(skus) == 0 {
		return nil
	}

	var ok bool

	// salesAttr 通过 spec_key_id 区分
	salesAttr := make(map[string]*dto.SalesAttr)

	specKeyMap := make(map[string]map[string]interface{})
	for _, sku := range skus {
		var specsInterfaceArray []interface{}
		if specsInterfaceArray, ok = sku["specs"].([]interface{}); !ok {
			continue
		}

		for _, specInterface := range specsInterfaceArray {
			var spec map[string]interface{}
			if spec, ok = specInterface.(map[string]interface{}); !ok {
				continue
			}

			saleAttr := &dto.SalesAttr{}
			saleAttr.Label = spec["spec_key"].(string)
			specKeyID := strconv.FormatFloat(spec["spec_key_id"].(float64), 'f', -1, 64)
			saleAttr.Pid = specKeyID
			salesAttr["p-"+specKeyID] = saleAttr

			specValueID := strconv.FormatFloat(spec["spec_value_id"].(float64), 'f', -1, 64)
			spec["image"] = sku["thumbUrl"]
			specKeyMap[specValueID] = spec

		}
	}

	for specValueID, spec := range specKeyMap {
		specKeyID := strconv.FormatFloat(spec["spec_key_id"].(float64), 'f', -1, 64)
		saleAttr := salesAttr["p-"+specKeyID]

		saleAttrValue := &dto.SalesAttrValue{}
		saleAttrValue.Text = spec["spec_value"].(string)
		saleAttrValue.Value = specValueID
		saleAttrValue.Image = spec["image"].(string)
		saleAttr.HasImage = "true"
		saleAttr.Values = append(saleAttr.Values, saleAttrValue)
	}

	return salesAttr
}

func pddParseDoorSkuSaleInfoSalesSkus(skus []map[string]interface{}) []*dto.SalesSku {
	if len(skus) == 0 {
		return nil
	}

	var ok bool

	salesSkus := make([]*dto.SalesSku, 0)
	for _, sku := range skus {
		salesSku := &dto.SalesSku{}

		var salePropPath string
		var specsInterfaceArray []interface{}
		if specsInterfaceArray, ok = sku["specs"].([]interface{}); !ok {
			continue
		}

		for i, specInterface := range specsInterfaceArray {
			spec := specInterface.(map[string]interface{})
			specKeyID := strconv.FormatFloat(spec["spec_key_id"].(float64), 'f', -1, 64)
			specValueID := strconv.FormatFloat(spec["spec_value_id"].(float64), 'f', -1, 64)
			salePropPath += specKeyID + ":" + specValueID

			if i != len(specsInterfaceArray)-1 {
				salePropPath += ";"
			}
		}

		salesSku.SalePropPath = salePropPath

		salesSku.Price = sku["groupPrice"].(string)

		var quantity float64
		quantityInterface := sku["quantity"]
		if quantity, ok = quantityInterface.(float64); !ok {
			quantity = 0
		}
		salesSku.Quantity = strconv.FormatFloat(quantity, 'f', -1, 64)

		salesSkus = append(salesSkus, salesSku)
	}

	return salesSkus
}

func pddParseDoorSkuSaleInfoQuantity(skus []map[string]interface{}) string {
	var ok bool

	var quantitySum float64
	for _, sku := range skus {
		var quantity float64
		quantityInterface := sku["quantity"]
		if quantity, ok = quantityInterface.(float64); !ok {
			continue
		}

		quantitySum += quantity
	}

	return strconv.FormatFloat(quantitySum, 'f', -1, 64)
}

func pddParseDoorSkuSaleInfoReviewNum(reviewNumInterface interface{}) string {
	var ok bool

	var reviewNum float64
	if reviewNum, ok = reviewNumInterface.(float64); !ok {
		return ""
	}
	return strconv.FormatFloat(reviewNum, 'f', -1, 64)
}

func pddParseDoorSkuSaleInfoSaleNum(saleNumInterface interface{}) string {
	var ok bool

	var saleNumStr string
	if saleNumStr, ok = saleNumInterface.(string); !ok {
		return "0"
	}

	numRe := regexp.MustCompile(`\d+\.?\d*`) // 匹配整数或小数
	numStr := numRe.FindString(saleNumStr)
	if numStr == "" {
		return "0"
	}

	// 提取单位部分
	// 定义单位换算表
	unitMap := map[string]float64{
		"十":  10,
		"百":  100,
		"千":  1000,
		"万":  10000,
		"十万": 100000,
		"百万": 1000000,
		"千万": 10000000,
		"亿":  100000000,
	}
	unitReStr := ""
	for k, _ := range unitMap {
		unitReStr += k + "|"
	}
	unitReStr = strings.TrimRight(unitReStr, "|")

	unitRe := regexp.MustCompile(unitReStr)
	unit := unitRe.FindString(saleNumStr)

	// 将字符串转换为浮点数
	num, err := strconv.ParseFloat(numStr, 64)
	if err != nil {
		return "0"
	}

	multiplier, exists := unitMap[unit]
	if !exists {
		multiplier = 1 // 如果没有匹配的单位，默认按原值计算
	}
	result := num * multiplier

	return strconv.FormatFloat(result, 'f', -1, 64)
}

func pddParseDoorSkuLogisticsInfo(doorSkuLogisticsInfo map[string]interface{}) map[string]interface{} {

	// 发货地址
	deliveryFromAddr := doorSkuLogisticsInfo["deliveryFromAddr"]
	doorSkuLogisticsInfo["deliveryFromAddr"] = pddParseDoorSkuLogisticsInfoDeliveryFromAddr(deliveryFromAddr)

	// 是否包邮
	isFreeShipping := doorSkuLogisticsInfo["isFreeShipping"]
	doorSkuLogisticsInfo["isFreeShipping"] = pddParseDoorSkuLogisticsInfoIsFreeShipping(isFreeShipping)

	return doorSkuLogisticsInfo
}

func pddParseDoorSkuLogisticsInfoDeliveryFromAddr(goodsPropertyInterface interface{}) string {
	var ok bool

	var goodsPropertyInterfaceArray []interface{}
	if goodsPropertyInterfaceArray, ok = goodsPropertyInterface.([]interface{}); !ok {
		return ""
	}

	var goodProperty map[string]interface{}
	for _, goodPropertyInterface := range goodsPropertyInterfaceArray {
		if goodProperty, ok = goodPropertyInterface.(map[string]interface{}); !ok {
			continue
		}

		key := goodProperty["key"].(string)
		if key != "发货地" {
			continue
		}

		values := goodProperty["values"].([]interface{})
		return values[0].(string) // 默认返回第一个发货地址
	}
	return ""
}

func pddParseDoorSkuLogisticsInfoIsFreeShipping(serviceInterface interface{}) bool {
	var ok bool
	var serviceInterfaceArray []interface{}
	if serviceInterfaceArray, ok = serviceInterface.([]interface{}); !ok {
		return false
	}

	for _, serviceInterface := range serviceInterfaceArray {
		var service map[string]interface{}
		if service, ok = serviceInterface.(map[string]interface{}); !ok {
			continue
		}
		key := service["type"].(string)
		if key == "全场包邮" {
			return true
		}
	}
	return false
}

func pddParseDoorSkuImageInfo(doorSkuImageInfo map[string]interface{}) map[string]interface{} {

	// 主图信息
	doorSkuImageInfos := doorSkuImageInfo["doorSkuImageInfos"]
	doorSkuImageInfo["doorSkuImageInfos"] = pddParseDoorSkuImageInfoDoorSkuImageInfos(doorSkuImageInfos)

	return doorSkuImageInfo
}

func pddParseDoorSkuImageInfoDoorSkuImageInfos(detailGalleryInterface interface{}) []map[string]interface{} {
	var ok bool

	var detailGalleryInterfaceArray []interface{}
	if detailGalleryInterfaceArray, ok = detailGalleryInterface.([]interface{}); !ok {
		return nil
	}

	doorSkuImageInfos := []map[string]interface{}{}
	for _, detailGalleryInterface := range detailGalleryInterfaceArray {
		var detailGallery map[string]interface{}
		if detailGallery, ok = detailGalleryInterface.(map[string]interface{}); !ok {
			continue
		}

		doorSkuImageInfo := map[string]interface{}{
			"type": "image",
		}
		doorSkuImageInfo["content"] = detailGallery["url"]
		doorSkuImageInfos = append(doorSkuImageInfos, doorSkuImageInfo)
	}
	return doorSkuImageInfos
}
