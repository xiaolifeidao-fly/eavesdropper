package repositories

import (
	"server/common/middleware/database"
	"server/internal/address/models"
)

type AddressRepository struct {
	database.Repository[*models.Address]
}

type AddressTemplateRepository struct {
	database.Repository[*models.AddressTemplate]
}

func (r *AddressTemplateRepository) GetByKeywordsAndResourceId(keywords string, resourceId uint64) (*models.AddressTemplate, error) {
	sql := "SELECT t.* FROM address a left join address_template t on a.id = t.address_id WHERE a.keywords = ? AND t.resource_id = ?"
	return r.GetOne(sql, keywords, resourceId)
}

func (r *AddressTemplateRepository) GetByAddressIdAndResourceId(addressId uint64, resourceId uint64) (*models.AddressTemplate, error) {
	sql := "SELECT * FROM address_template WHERE address_id = ? AND resource_id = ?"
	return r.GetOne(sql, addressId, resourceId)
}

func (r *AddressRepository) GetByKeywords(keywords string) (*models.Address, error) {
	sql := "SELECT * FROM address WHERE keywords = ?"
	return r.GetOne(sql, keywords)
}
