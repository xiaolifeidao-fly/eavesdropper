package database

import (
	"server/common/base"

	"gorm.io/gorm"
)

type Entity interface {
	TableName() string
	Init()
}

type BaseEntity struct {
	ID        uint64         `json:"id"`
	CreatedBy uint64         `json:"createdBy"`
	UpdatedBy uint64         `json:"updatedBy"`
	CreatedAt base.Time      `json:"createdAt"`
	UpdatedAt base.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-"`
}

func (e *BaseEntity) TableName() string {
	return ""
}

func (e *BaseEntity) Init() {
	if e.CreatedAt.IsZero() {
		e.CreatedAt = base.Now()
	}
	if e.UpdatedAt.IsZero() {
		e.UpdatedAt = base.Now()
	}
}
