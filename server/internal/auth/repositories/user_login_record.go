package repositories

import (
	"server/common/base"
	"server/internal/auth/models"

	"gorm.io/gorm"
)

type UserLoginRecord struct {
	base.Repository[*models.UserLoginRecord]
}

func NewUserLoginRecordRepository(dbs ...*gorm.DB) *UserLoginRecord {
	return &UserLoginRecord{Repository: *base.NewRepository[*models.UserLoginRecord](dbs...)}
}

// FindByUserID 根据用户ID查询登录记录
func (r *UserLoginRecord) FindByUserID(userID uint64, entities []*models.UserLoginRecord) error {
	return r.DB.Debug().Where("user_id = ?", userID).Find(entities).Error
}

// FindLastByUserID 根据用户ID查询最后一次登录记录
func (r *UserLoginRecord) FindLastByUserID(userID uint64, entity *models.UserLoginRecord) error {
	return r.DB.Debug().Where("user_id = ?", userID).Order("id desc").Find(entity).Error
}
