package domain

import (
	"context"
	"server-zero/internal/model"
	"time"

	"gorm.io/gorm"
)

type CustomerDomain struct {
	db *gorm.DB
}

func NewCustomerDomain(db *gorm.DB) *CustomerDomain {
	return &CustomerDomain{db: db}
}

func (d CustomerDomain) Create(ctx context.Context, data *model.Customer) error {
	data.CreatedAt = time.Now()
	data.UpdatedAt = data.CreatedAt
	return d.GetDB(ctx).Create(data).Error
}

func (d CustomerDomain) FindByID(ctx context.Context, id int) *model.Customer {
	var data model.Customer
	d.GetDB(ctx).Where("id = ?", id).First(&data)
	if data.ID == 0 {
		return nil
	}
	return &data
}

func (d CustomerDomain) Update(ctx context.Context, id int, data *model.Customer) error {
	data.UpdatedAt = time.Now()
	return d.GetDB(ctx).Where("id = ?", id).Updates(data).Error
}

func (d CustomerDomain) GetDB(ctx context.Context) *gorm.DB {
	return d.db.Table(new(model.Customer).TableName()).WithContext(ctx)
}

type QueryParams struct {
	Name string
}

func (d CustomerDomain) Query(ctx context.Context, params QueryParams) []*model.Customer {
	var data []*model.Customer
	db := d.GetDB(ctx)
	if params.Name != "" {
		db = db.Where("name LIKE ?", "%"+params.Name+"%")
	}
	db.Find(&data)
	return data
}
