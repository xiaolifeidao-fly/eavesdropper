package repositories

import (
	"server/common/base"
	"server/internal/auth/models"

	"gorm.io/gorm"
)

type User struct {
	base.Repository[*models.User]
}

func NewUserRepository(dbs ...*gorm.DB) *User {
	return &User{Repository: *base.NewRepository[*models.User](dbs...)}
}

func (r *User) FindByAccount(account string, entity *models.User) error {
	return r.DB.Debug().Where("account = ?", account).Find(entity).Error
}

func (r *User) FindUnscopedByAccount(account string, entity *models.User) error {
	return r.DB.Debug().Unscoped().Where("account = ?", account).Find(entity).Error
}
