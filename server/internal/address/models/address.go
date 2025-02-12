package models

import "server/common/middleware/database"

type Address struct {
	database.BaseEntity
	ProvinceCode string `json:"province_code"`
	CityCode     string `json:"city_code"`
	CityName     string `json:"city_name"`
	CountryCode  string `json:"country_code"`
	Keywords     string `json:"keywords"`
}

type AddressTemplate struct {
	database.BaseEntity
	ResourceId uint64 `json:"resource_id"`
	AddressId  uint64 `json:"address_id"`
	TemplateId string `json:"template_id"`
}

func (a *Address) TableName() string {
	return "address"
}

func (a *AddressTemplate) TableName() string {
	return "address_template"
}
