package model

import (
	"time"
)

// Customer 用户列表
type Customer struct {
	ID        int       `gorm:"primaryKey;column:id" json:"-"`      // 主键ID
	Name      string    `gorm:"column:name" json:"name"`            // 支付方式显示名
	Password  string    `gorm:"column:password" json:"password"`    // 支付方式显示名
	Active    int       `gorm:"column:active" json:"active"`        // 0-禁用, 1-正常
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"` // 创建时间
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"` // 更新时间
	CreatedBy string    `gorm:"column:created_by" json:"createdBy"` // 创建人
	UpdatedBy string    `gorm:"column:updated_by" json:"updatedBy"` // 更新人
}

// TableName get sql table name.获取数据库表名
func (m *Customer) TableName() string {
	return "customer"
}
