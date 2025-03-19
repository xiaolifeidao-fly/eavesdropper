package dto

import "server/common/base/dto"

var (
	TaoBao = ResourceSourceEnum{"某宝", "taobao", "blue", "https://item.taobao.com/item.htm?id=%s"}
	Pdd    = ResourceSourceEnum{"拼西西", "pdd", "blue", "https://mobile.yangkeduo.com/goods1.html?goods_id=%s"}
)

type ResourceSourceEnum struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
	Url   string `json:"url"`
}

func ResourceSourceEnumValues() []ResourceSourceEnum {
	return []ResourceSourceEnum{TaoBao, Pdd}
}

func GetResourceSourceEnumByValue(value string) *ResourceSourceEnum {
	switch value {
	case TaoBao.Value:
		return &TaoBao
	case Pdd.Value:
		return &Pdd
	}
	return nil
}

type ResourceSourceDTO struct {
	dto.LabelValueDTO
}

type ResourceTagDTO struct {
	dto.LabelValueDTO
}
