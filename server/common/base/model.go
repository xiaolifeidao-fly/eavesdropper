package base

import (
	"time"

	"gorm.io/gorm"
)

type ModelInterface interface {
	SetCreatedBy(createdBy uint64)
	SetUpdatedBy(updatedBy uint64)
	SetDeletedAt()
}

type Model struct {
	ID        uint64         `json:"id"`
	CreatedBy uint64         `json:"createdBy"`
	UpdatedBy uint64         `json:"updatedBy"`
	CreatedAt Time           `json:"createdAt"`
	UpdatedAt Time           `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-"`
}

func (m *Model) SetCreatedBy(createdBy uint64) {
	m.CreatedBy = createdBy
}

func (m *Model) SetUpdatedBy(updatedBy uint64) {
	m.UpdatedBy = updatedBy
}

func (m *Model) SetDeletedAt() {
	m.DeletedAt = gorm.DeletedAt{Time: time.Now(), Valid: true}
}
