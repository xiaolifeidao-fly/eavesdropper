package extractor

import (
	"github.com/tidwall/gjson"
)

// ResolveJSON 递归解析规则并从输入 JSON 中提取值
// 规则示例：
// input: `{"skuInfo": {"item": {"images": ["image1.jpg", "image2.jpg"], "title": "Product Title"}}}`
// ruleMap:
//
//	{
//	    "skuInfo": {
//	        "mainImages": "skuInfo.item.images",
//	        "title": "skuInfo.item.title"
//	    }
//	}
func ResolveJSON(input string, ruleMap map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for key, value := range ruleMap {
		switch v := value.(type) {
		case map[string]interface{}:
			// 如果是 map，则递归处理
			result[key] = ResolveJSON(input, v)
		case string:
			// 如果是字符串，视为 gjson 路径
			result[key] = gjson.Get(input, v).Value()
		default:
			// 其他类型，保留原始值
			result[key] = value
		}
	}
	return result
}
