package repositories

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
)

var UserRepository = database.NewRepository[userRepository]()

type userRepository struct {
	database.Repository[*models.User]
}

func (r *userRepository) FindByMobile(mobile string) (*models.User, error) {
	return r.GetOne("select * from auth_user where mobile = ?", mobile)
}
