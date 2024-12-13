package repositories

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
)

var UserLoginRecordRepository = database.NewRepository[userLoginRecordRepository]()

type userLoginRecordRepository struct {
	database.Repository[*models.UserLoginRecord]
}

// FindLastByUserID
// @Description 根据用户ID查找最后一次登录记录
func (r *userLoginRecordRepository) FindLastByUserID(userID uint64) (*models.UserLoginRecord, error) {
	return r.GetOne("select * from auth_user_login_record where user_id = ? order by created_at desc limit 1", userID)
}
