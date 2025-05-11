package models

import (
	"server/common/middleware/database"
)

type Opinion struct {
	database.BaseEntity
}

func (r *Opinion) TableName() string {
	return "opinion"
}
