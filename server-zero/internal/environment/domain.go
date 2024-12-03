package environment

import (
	"gorm.io/gorm"
	"server-zero/internal/domain"
)

type DomainEnv struct {
	CustomerDomain *domain.CustomerDomain
}

func NewDomainEnv(otcDB *gorm.DB) *DomainEnv {
	return &DomainEnv{
		CustomerDomain: domain.NewCustomerDomain(otcDB),
	}
}
