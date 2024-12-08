package database

import (
	"gorm.io/gorm"
)

type Configure interface {
	Init(dirver string, config *gorm.Config) (*gorm.DB, error)
}
