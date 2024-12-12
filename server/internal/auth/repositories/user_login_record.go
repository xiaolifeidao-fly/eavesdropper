package repositories

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
)

var UserLoginRecordRepository = database.NewRepository[*models.UserLoginRecord]()
