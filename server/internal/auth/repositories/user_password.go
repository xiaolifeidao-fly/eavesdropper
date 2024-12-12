package repositories

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
)

var UserPasswordRepository = database.NewRepository[*models.UserPassword]()
