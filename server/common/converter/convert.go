package converter

import (
	"server/common/base/dto"
	"server/common/base/vo"

	"github.com/jinzhu/copier"
)

func Copy(toValue any, fromValue any) {
	copier.Copy(toValue, fromValue)
}

func ToVO[V any](dto dto.DTO) *V {
	var voInstance V
	Copy(&voInstance, dto)
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
	Copy(&dtoInstance, vo)
	return &dtoInstance
}

func ToDTOs[D any, V vo.VO](vos []V) []*D {
	var dtos []*D
	for _, vo := range vos {
		dtos = append(dtos, ToDTO[D](vo))
	}
	return dtos
}
