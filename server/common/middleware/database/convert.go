package database

import (
	"server/common/base/dto"

	"github.com/jinzhu/copier"
)

func ToPO[V any](dto dto.DTO) *V {
	var voInstance V
	copier.Copy(&voInstance, dto)
	return &voInstance
}

func ToPOs[V any, D dto.DTO](dtos []D) []*V {
	var vos []*V
	for _, dto := range dtos {
		vos = append(vos, ToPO[V](dto))
	}
	return vos
}

func ToDTO[D any](po Entity) *D {
	var dtoInstance D
	copier.Copy(&dtoInstance, po)
	return &dtoInstance
}

func ToDTOs[D any, P Entity](vos []P) []*D {
	var dtos []*D
	for _, vo := range vos {
		dtos = append(dtos, ToDTO[D](vo))
	}
	return dtos
}
