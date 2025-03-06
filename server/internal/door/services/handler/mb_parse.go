package handler

import (
	"encoding/json"
	"log"
	"server/common/extractor"
	"server/internal/door/services/dto"
	"slices"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type MBParse struct{}

func (mb *MBParse) GetExtractorRule() map[string]interface{} {
	return map[string]interface{}{
		"baseInfo": map[string]interface{}{
			"mainImages":  "skuInfo.item.images",
			"title":       "skuInfo.item.title",
			"guideTitle":  "skuInfo.item.title",
			"itemId":      "skuInfo.item.itemId",
			"skuItemInfo": "skuInfo.componentsVO.extensionInfoVO.infos",
		},
		"doorSkuSaleInfo": map[string]interface{}{
			"salesAttr": "skuInfo.skuBase.props", // salesAttr 需要进行一定的规则解析 mbParseDoorSkuSaleInfoSalesAttrs
			// salesSkus 需要进行一定的规则解析 mbParseDoorSkuSaleInfoSalesSkus
			"salesSkus":  "skuInfo.skuBase.skus",     // 得到的是通过销售属性笛卡尔积生成的销售规格列表
			"salesSkus2": "skuInfo.skuCore.sku2info", // 详细的销售规格列表， 提取价格和库存
			// 0 代表的是汇总的 sku2info 是一个数组，基于销售属性来填充
			"price":    "skuInfo.skuCore.sku2info.0.price.priceText",
			"quantity": "skuInfo.skuCore.sku2info.0.quantity",
		},
		// 商品详情: 获取到的数据是一段html, 需要通过正则表达式提取，查看函数 mbParseDoorSkuImageInfo
		"doorSkuImageInfo": map[string]interface{}{
			"doorSkuImageInfos": "skuDetail.components",
		},
		"deliveryVO": "skuInfo.componentsVO.deliveryVO",
	}
}

func (mb *MBParse) ParseDoorInfo(doorInfoMap *map[string]interface{}) *dto.DoorSkuDTO {
	doorInfoDTO := &dto.DoorSkuDTO{}

	// 解析信息, 可以直接取的信息
	doorInfoRule := mb.GetExtractorRule()
	doorInfoJson, _ := json.Marshal(*doorInfoMap)
	doorInfoValueMap := extractor.ResolveJSON(string(doorInfoJson), doorInfoRule)

	doorSkuSaleInfoValueMap := doorInfoValueMap["doorSkuSaleInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuSaleInfo"] = mbParseDoorSkuSaleInfo(doorSkuSaleInfoValueMap)

	// 图文信息特俗处理, 需要通过正则表达式提取的信息
	doorSkuImageInfoMap := doorInfoValueMap["doorSkuImageInfo"].(map[string]interface{})
	doorInfoValueMap["doorSkuImageInfo"] = mbParseDoorSkuImageInfo(doorSkuImageInfoMap)

	doorInfoMapJson, _ := json.Marshal(doorInfoValueMap)
	json.Unmarshal(doorInfoMapJson, doorInfoDTO)

	setMbDoorRequiredDefault(doorInfoDTO, doorInfoValueMap)
	doorInfoDTO.SetRequiredDefault(doorInfoValueMap)
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
		salesAttrValue["hasImage"] = salesAttrValueMap["hasImage"]
		salesAttrValue["comboProperty"] = salesAttrValueMap["comboProperty"]
		salesAttrValue["packPro"] = salesAttrValueMap["packProp"]
		salesAttrValue["pid"] = salesAttrValueMap["pid"]

		salesAttrValues := []map[string]interface{}{}
		for _, propsValue := range propsValues {
			salesAttrValue := map[string]interface{}{
				"text":      propsValue["name"],
				"value":     propsValue["vid"],
				"image":     propsValue["image"],
				"sortOrder": propsValue["sortOrder"],
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
		priceText := price["priceText"].(string)
		priceFloat, _ := strconv.ParseFloat(priceText, 64)
		subPrice, ok := salesSkus2Value["subPrice"].(map[string]interface{})
		if ok {
			subPriceFloat, _ := strconv.ParseFloat(subPrice["priceText"].(string), 64)
			if subPriceFloat < priceFloat {
				priceText = subPrice["priceText"].(string)
			}
		}

		salesSku := map[string]interface{}{
			"salePropPath": salesSkuValue["propPath"],
			"price":        priceText,
			"quantity":     salesSkus2Value["quantity"],
		}
		salesSkus = append(salesSkus, salesSku)
	}
	doorSkuSaleInfoValueMap["salesSkus"] = salesSkus
}

func getMbDoorSkuImageInfosHtml(layout []interface{}, componentData map[string]interface{}) string {
	for _, layout := range layout {
		layoutMap := layout.(map[string]interface{})
		id := layoutMap["ID"].(string)
		key := layoutMap["key"].(string)
		if key == "desc_richtext" {
			return componentData[id].(map[string]interface{})["model"].(map[string]interface{})["text"].(string)
		}
	}
	return ""
}

func appendMbFromImageHtml(layout []interface{}, componentData map[string]interface{}, infoMap []map[string]interface{}) []map[string]interface{} {
	doorSkuImageInfosHtml := getMbDoorSkuImageInfosHtml(layout, componentData)
	if len(doorSkuImageInfosHtml) == 0 {
		return infoMap
		// doorSkuImageInfosHtml = strings.ReplaceAll(doorSkuImageInfosHtml, "\\", "")
		// re := regexp.MustCompile(`<(imgsrc)="([^"]+)"`)
		// matches := re.FindAllStringSubmatch(doorSkuImageInfosHtml, -1)
		// for _, match := range matches {
		// 	if len(match) > 1 {
		// 		contentType := match[1]
		// 		if contentType == "imgsrc" {
		// 			contentType = "image"
		// 		} else {
		// 			// 错误的类型, 在淘宝发布文字自动转为图片
		// 			continue
		// 		}

		// 		content := match[2]
		// 		doorSkuImageInfo := map[string]interface{}{
		// 			"type":    contentType,
		// 			"content": content,
		// 		}
		// 		infoMap = append(infoMap, doorSkuImageInfo)
		// 	}
		// }
	}

	doorSkuImageInfosHtml = strings.ReplaceAll(doorSkuImageInfosHtml, "\n", "")
	doorSkuImageInfosHtml = strings.ReplaceAll(doorSkuImageInfosHtml, `\"`, "")
	htmlTags := []string{"<h1", "<h2", "<h3", "<h4", "<h5", "<h6", "<p", "<div", "<span", "<img", "<b"}
	for _, htmlTag := range htmlTags {
		doorSkuImageInfosHtml = strings.ReplaceAll(doorSkuImageInfosHtml, htmlTag, htmlTag+" ")
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(doorSkuImageInfosHtml))
	if err != nil {
		log.Fatal(err)
		return infoMap
	}
	// 遍历所有 <img> 元素，获取 src 属性
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if exists {
			infoMap = append(infoMap, map[string]interface{}{
				"type":    "image",
				"content": src,
			})
		}
	})

	return infoMap
}

func appendMbFromSingleImage(layout []interface{}, componentData map[string]interface{}, infoMap []map[string]interface{}) []map[string]interface{} {
	filterLocateIds := []string{"1690748715"}
	for _, layout := range layout {
		layoutMap := layout.(map[string]interface{})
		id := layoutMap["ID"].(string)
		key := layoutMap["key"].(string)
		if key == "desc_single_image" {
			model := componentData[id].(map[string]interface{})["model"].(map[string]interface{})
			if _, ok := model["text"]; ok {
				continue
			}
			if _, ok := model["picUrl"]; ok {
				locateId := model["locateId"].(string)
				if slices.Contains(filterLocateIds, locateId) {
					continue
				}
				picUrl := model["picUrl"].(string)
				if !strings.HasPrefix(picUrl, "https:") {
					picUrl = "https:" + picUrl
				}
				infoMap = append(infoMap, map[string]interface{}{
					"type":    "image",
					"content": picUrl,
				})
			}
		}
	}
	return infoMap
}

// 解析商品详情中的图片信息
func mbParseDoorSkuImageInfo(doorSkuImageInfoValeMap map[string]interface{}) map[string]interface{} {
	if doorSkuImageInfoValeMap == nil || doorSkuImageInfoValeMap["doorSkuImageInfos"] == nil {
		return nil
	}
	doorSkuImageInfoValeMap = doorSkuImageInfoValeMap["doorSkuImageInfos"].(map[string]interface{})

	layout := doorSkuImageInfoValeMap["layout"].([]interface{})

	componentData := doorSkuImageInfoValeMap["componentData"].(map[string]interface{})
	for _, layout := range layout {
		layoutMap := layout.(map[string]interface{})
		layoutMap["children"] = []interface{}{}
	}
	infoMap := []map[string]interface{}{}
	infoMap = appendMbFromImageHtml(layout, componentData, infoMap)
	infoMap = appendMbFromSingleImage(layout, componentData, infoMap)
	doorSkuImageInfoValeMap["doorSkuImageInfos"] = infoMap
	return doorSkuImageInfoValeMap
}

func setMbDoorRequiredDefault(doorInfoDTO *dto.DoorSkuDTO, doorInfoValueMap map[string]interface{}) {
	setMbBaseInfoRequiredDefault(doorInfoDTO, doorInfoValueMap["baseInfo"].(map[string]interface{}))
	setMbLogisticsInfoRequiredDefault(doorInfoDTO, doorInfoValueMap["deliveryVO"].(map[string]interface{}))
}

func setMbBaseInfoRequiredDefault(doorInfoDTO *dto.DoorSkuDTO, doorInfoValueMap map[string]interface{}) {
	skuItemInfos := doorInfoValueMap["skuItemInfo"].([]interface{})
	skuItems := []*dto.SkuItem{}
	for _, skuItemInfo := range skuItemInfos {
		skuItemInfoMap := skuItemInfo.(map[string]interface{})
		itemType := skuItemInfoMap["type"]
		if itemType == "BASE_PROPS" {
			items := skuItemInfoMap["items"].([]interface{})
			for _, item := range items {
				itemMap := item.(map[string]interface{})
				skuItem := &dto.SkuItem{}
				skuItem.Title = itemMap["title"].(string)
				texts := itemMap["text"].([]interface{})
				skuItem.Text = make([]string, len(texts))
				for i, text := range texts {
					skuItem.Text[i] = text.(string)
				}
				skuItems = append(skuItems, skuItem)
			}
		}
		if itemType == "CERTIFICATION" {
			items := skuItemInfoMap["items"].([]interface{})
			if len(items) > 0 {
				item := items[0].(map[string]interface{})
				skuItem := &dto.SkuItem{}
				skuItem.Text = []string{item["actionLink"].(string)}
				skuItem.Title = skuItemInfoMap["title"].(string)
				skuItems = append(skuItems, skuItem)
			}
		}
	}
	doorInfoDTO.BaseInfo.SkuItems = skuItems
}

func setMbLogisticsInfoRequiredDefault(doorInfoDTO *dto.DoorSkuDTO, deliveryVO map[string]interface{}) {
	d := doorInfoDTO.DoorSkuLogisticsInfo

	d.DeliveryFromAddr = deliveryVO["deliveryFromAddr"].(string)
	freight := deliveryVO["freight"].(string)
	if strings.Contains(freight, "免运费") {
		d.IsFreeShipping = true
	} else {
		d.IsFreeShipping = false
	}
}
