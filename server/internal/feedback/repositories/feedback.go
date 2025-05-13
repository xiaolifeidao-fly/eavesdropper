package repositories

import (
	"server/common/middleware/database"
	"server/internal/feedback/models"
)

var FeedbackRepository = database.NewRepository[feedbackRepository]()

type feedbackRepository struct {
	database.Repository[*models.Feedback]
}
