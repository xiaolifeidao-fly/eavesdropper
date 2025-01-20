package services

import (
	baseDto "server/common/base/dto"
)

const (
	ResourceSourceTaobao      = "taobao" // 淘宝
	ResourceSourceTaobaoLabel = "淘宝"

	ResourceTagMain      = "main" // 主号
	ResourceTagMainLabel = "主账号"
	ResourceTagDept      = "deputy" // 辅助号
	ResourceTagDeptLabel = "辅助账号"
)

// GetResourceSourceList 获取资源来源列表
func GetResourceSourceList() []*baseDto.LabelValueDTO {
	labelValueDTOs := make([]*baseDto.LabelValueDTO, 0)
	labelValueDTOs = append(labelValueDTOs, &baseDto.LabelValueDTO{
		Label: ResourceSourceTaobaoLabel,
		Value: ResourceSourceTaobao,
	})
	return labelValueDTOs
}

// GetResourceSourceLabel 获取资源来源标签
func GetResourceSourceLabel(source string) *baseDto.LabelValueDTO {
	switch source {
	case ResourceSourceTaobao:
		return &baseDto.LabelValueDTO{
			Label: ResourceSourceTaobaoLabel,
			Value: ResourceSourceTaobao,
			Color: "blue",
		}
	}
	return nil
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
