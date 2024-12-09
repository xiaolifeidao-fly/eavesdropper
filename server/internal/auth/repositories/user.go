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

func (r *User) FindByUsername(username string, entity *models.User) error {
	return r.DB.Debug().Where("username = ?", username).Find(entity).Error
}

func (r *User) FindUnscopedByUsername(username string, entity *models.User) error {
	return r.DB.Debug().Unscoped().Where("username = ?", username).Find(entity).Error
}

func (r *User) FindByMobile(mobile string, entity *models.User) error {
	return r.DB.Debug().Where("mobile = ?", mobile).Find(entity).Error
}

func (r *User) FindUnscopedByMobile(mobile string, entity *models.User) error {
	return r.DB.Debug().Unscoped().Where("mobile = ?", mobile).Find(entity).Error
}
