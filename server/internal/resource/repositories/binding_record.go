package repositories

import (
	"server/common/middleware/database"
	"server/internal/resource/models"
)

var ResourceTokenBindingRecordRepository = database.NewRepository[resourceTokenBindingRecordRepository]()

type resourceTokenBindingRecordRepository struct {
	database.Repository[*models.ResourceTokenBindingRecord]
}
