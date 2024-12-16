package converter

import (
	"server/common"
	"server/common/converter"
	"server/internal/auth/services/dto"
)

func ConverterUserInfoDTO(userDTO *dto.UserDTO) *dto.UserInfoDTO {
	userInfoDTO := &dto.UserInfoDTO{}
	converter.Copy(userInfoDTO, userDTO)
	return userInfoDTO
}

func UserAddDTOToUserDTO(userAddDTO *dto.UserAddDTO) *dto.UserDTO {
	userDTO := &dto.UserDTO{}
	converter.Copy(userDTO, userAddDTO)
	userDTO.CreatedBy = common.GetLoginUserID()
	userDTO.UpdatedBy = common.GetLoginUserID()
	return userDTO
}

func ConverterUserPasswordDTO(userID uint64, password string) *dto.UserPasswordDTO {
	userPasswordDTO := &dto.UserPasswordDTO{}
	userPasswordDTO.UserID = userID
	userPasswordDTO.Password = password
	loginUserID := common.GetLoginUserID()
	if loginUserID <= 0 {
		loginUserID = userID
	}
	userPasswordDTO.CreatedBy = loginUserID
	userPasswordDTO.UpdatedBy = loginUserID
	return userPasswordDTO
}

func ConverterUserLoginInfoDTO(userInfoDTO *dto.UserInfoDTO) *dto.UserLoginInfoDTO {
	userLoginInfoDTO := &dto.UserLoginInfoDTO{}
	converter.Copy(userLoginInfoDTO, userInfoDTO)
	return userLoginInfoDTO
}
