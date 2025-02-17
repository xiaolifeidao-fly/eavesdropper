package services

import (
	"server/common/middleware/database"
	"server/internal/address/models"
	"server/internal/address/repositories"
	"server/internal/address/services/dto"
)

var addressRepository = database.NewRepository[repositories.AddressRepository]()
var addressTemplateRepository = database.NewRepository[repositories.AddressTemplateRepository]()

func GetAddressByKeywordsAndUserNumId(keywords string, userNumId string) (*dto.AddressTemplateDTO, error) {
	addressTemplate, err := addressTemplateRepository.GetByKeywordsAndUserNumId(keywords, userNumId)
	if err != nil {
		return nil, err
	}
	if addressTemplate == nil {
		return nil, nil
	}
	return database.ToDTO[dto.AddressTemplateDTO](addressTemplate), nil
}

func GetAddressByKeywords(keywords string) (*dto.AddressDTO, error) {
	address, err := addressRepository.GetByKeywords(keywords)
	if err != nil {
		return nil, err
	}
	if address == nil {
		return nil, nil
	}
	return database.ToDTO[dto.AddressDTO](address), nil
}

func SaveAddressTemplate(addressTemplateDTO *dto.AddressTemplateDTO) (*dto.AddressTemplateDTO, error) {
	addressTemplate, err := addressTemplateRepository.GetByAddressIdAndUserNumId(addressTemplateDTO.AddressId, addressTemplateDTO.UserNumId)
	if err != nil {
		return nil, err
	}
	if addressTemplate == nil {
		addressTemplate = database.ToPO[models.AddressTemplate](addressTemplateDTO)
	} else {
		addressTemplate.TemplateId = addressTemplateDTO.TemplateId
	}
	addressTemplate, err = addressTemplateRepository.SaveOrUpdate(addressTemplate)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.AddressTemplateDTO](addressTemplate), nil
}

func SaveAddress(addressDTO *dto.AddressDTO) (*dto.AddressDTO, error) {
	address, err := addressRepository.GetByKeywords(addressDTO.Keywords)
	if err != nil {
		return nil, err
	}
	if address == nil {
		address = database.ToPO[models.Address](addressDTO)
	} else {
		address.ProvinceCode = addressDTO.ProvinceCode
		address.CityCode = addressDTO.CityCode
		address.CityName = addressDTO.CityName
		address.Keywords = addressDTO.Keywords
		address.CountryCode = addressDTO.CountryCode
	}
	address, err = addressRepository.SaveOrUpdate(address)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.AddressDTO](address), nil
}
