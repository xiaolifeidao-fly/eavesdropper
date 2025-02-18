package dto

import "server/common/base/dto"

type AddressDTO struct {
	dto.BaseDTO
	ProvinceCode string `json:"provinceCode"`
	CityCode     string `json:"cityCode"`
	CityName     string `json:"cityName"`
	CountryCode  string `json:"countryCode"`
	Keywords     string `json:"keywords"`
}

type AddressTemplateDTO struct {
	dto.BaseDTO
	UserNumId  string `json:"userNumId"`
	ResourceId uint64 `json:"resourceId"`
	AddressId  uint64 `json:"addressId"`
	TemplateId string `json:"templateId"`
}
