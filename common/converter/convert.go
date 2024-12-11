package converter

import (
	"galactus/common/base/dto"
	"galactus/common/base/vo"

	"github.com/jinzhu/copier"
)

func ToVO[V any](dto dto.DTO) *V {
	var voInstance V
	copier.Copy(&voInstance, dto)
	return &voInstance
}

func ToVOs[V any, D dto.DTO](dtos []D) []*V {
	var vos []*V
	for _, dto := range dtos {
		vos = append(vos, ToVO[V](dto))
	}
	return vos
}

func ToDTO[D any](vo vo.VO) *D {
	var dtoInstance D
	copier.Copy(&dtoInstance, vo)
	return &dtoInstance
}

func ToDTOs[D any, V vo.VO](vos []V) []*D {
	var dtos []*D
	for _, vo := range vos {
		dtos = append(dtos, ToDTO[D](vo))
	}
	return dtos
}

func ToPage[V any, D dto.DTO](total int, dtos []D) *vo.Page[V] {
	var vData []*V = ToVOs[V](dtos)
	return vo.BuildPage(total, vData)
}
