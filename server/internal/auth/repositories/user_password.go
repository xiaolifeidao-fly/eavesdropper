package repositories

import (
	"server/common/base"
	"server/internal/auth/models"

	"gorm.io/gorm"
)

type UserPassword struct {
	base.Repository[*models.UserPassword]
}

func NewUserPasswordRepository(dbs ...*gorm.DB) *UserPassword {
	return &UserPassword{Repository: *base.NewRepository[*models.UserPassword](dbs...)}
}

func (r *UserPassword) FindByUserID(userID uint64, entity *models.UserPassword) error {
	return r.DB.Debug().Where("user_id = ?", userID).Find(entity).Error
}
