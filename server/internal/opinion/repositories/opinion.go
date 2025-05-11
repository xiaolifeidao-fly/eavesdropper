package repositories

import (
	"server/common/middleware/database"
	"server/internal/opinion/models"
)

var OpinionRepository = database.NewRepository[opinionRepository]()

type opinionRepository struct {
	database.Repository[*models.Opinion]
}
