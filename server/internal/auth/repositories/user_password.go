package repositories

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
)

var UserPasswordRepository = database.NewRepository[userPasswordRepository]()

type userPasswordRepository struct {
	database.Repository[*models.UserPassword]
}

// FindByUserID 根据用户ID获取用户密码
func (r *userPasswordRepository) FindByUserID(userID uint64) (*models.UserPassword, error) {
	return r.GetOne("select * from auth_user_password where user_id = ?", userID)
}
