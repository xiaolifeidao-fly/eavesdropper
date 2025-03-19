package services

import (
	baseDto "server/common/base/dto"
	"server/internal/resource/services/dto"
)

const (
	// ResourceSourceTaobao       = "taobao" // 某宝
	// ResourceSourceTaobaoLabel  = "某宝"
	// ResourceSourceTaobaoSkuUrl = "https://item.taobao.com/item.htm?id=%s"

	// ResourceSourcePdd       = "pdd" // 拼西西
	// ResourceSourcePddLabel  = "拼西西"
	// ResourceSourcePddSkuUrl = "https://mobile.yangkeduo.com/goods1.html?goods_id=%s"

	ResourceTagMain      = "main" // 主号
	ResourceTagMainLabel = "主账号"
	ResourceTagDept      = "deputy" // 辅助号
	ResourceTagDeptLabel = "辅助账号"
)

// GetResourceSourceList 获取资源来源列表
func GetResourceSourceList() []*baseDto.LabelValueDTO {
	labelValueDTOs := make([]*baseDto.LabelValueDTO, 0)
	values := dto.ResourceSourceEnumValues()
	for _, value := range values {
		labelValueDTOs = append(labelValueDTOs, &baseDto.LabelValueDTO{
			Label: value.Label,
			Value: value.Value,
			Color: value.Color,
		})
	}
	return labelValueDTOs
}

// GetResourceSourceLabel 获取资源来源标签
func GetResourceSourceLabel(source string) *baseDto.LabelValueDTO {
	value := dto.GetResourceSourceEnumByValue(source)
	if value == nil {
		return nil
	}

	return &baseDto.LabelValueDTO{
		Label: value.Label,
		Value: value.Value,
		Color: value.Color,
	}
}

func GetResourceSkuUrl(source string) string {
	value := dto.GetResourceSourceEnumByValue(source)
	if value == nil {
		return ""
	}

	return value.Url
}

// GetResourceTagList 获取资源标签列表
func GetResourceTagList() []*baseDto.LabelValueDTO {
	labelValueDTOs := make([]*baseDto.LabelValueDTO, 0)
	labelValueDTOs = append(labelValueDTOs, &baseDto.LabelValueDTO{
		Label: ResourceTagMainLabel,
		Value: ResourceTagMain,
	})
	labelValueDTOs = append(labelValueDTOs, &baseDto.LabelValueDTO{
		Label: ResourceTagDeptLabel,
		Value: ResourceTagDept,
	})
	return labelValueDTOs
}

// GetResourceTagLabel 获取资源标签标签
func GetResourceTagLabel(tag string) *baseDto.LabelValueDTO {
	switch tag {
	case ResourceTagMain:
		return &baseDto.LabelValueDTO{
			Label: ResourceTagMainLabel,
			Value: ResourceTagMain,
			Color: "blue",
		}
	case ResourceTagDept:
		return &baseDto.LabelValueDTO{
			Label: ResourceTagDeptLabel,
			Value: ResourceTagDept,
			Color: "blue",
		}
	}
	return nil
}
