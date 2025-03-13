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

func (r *AddressTemplateRepository) GetByKeywordsAndUserNumId(keywords string, userId string) (*models.AddressTemplate, error) {
	sql := "SELECT t.* FROM address a left join address_template t on a.id = t.address_id WHERE a.keywords = ? AND t.user_id = ?"
	return r.GetOne(sql, keywords, userId)
}

func (r *AddressTemplateRepository) GetByAddressIdAndUserId(addressId uint64, userId string) (*models.AddressTemplate, error) {
	sql := "SELECT * FROM address_template WHERE address_id = ? AND user_id = ?"
	return r.GetOne(sql, addressId, userId)
}

func (r *AddressRepository) GetByKeywords(keywords string) (*models.Address, error) {
	sql := "SELECT * FROM address WHERE keywords = ?"
	return r.GetOne(sql, keywords)
}
