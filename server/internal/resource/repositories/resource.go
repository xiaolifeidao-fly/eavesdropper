package repositories

import (
	"server/common/middleware/database"
	"server/internal/resource/models"
)

var ResourceRepository = database.NewRepository[resourceRepository]()

type resourceRepository struct {
	database.Repository[*models.Resource]
}
