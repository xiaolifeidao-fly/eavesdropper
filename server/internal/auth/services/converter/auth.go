package converter

import (
	"server/common"
	"server/common/base"
	"server/common/captcha"
	"server/common/converter"
	"server/internal/auth/services/dto"
)

// LoginDTOToUserLoginRecordDTO 登录DTO转换为登录记录DTO
func UserDTOLoginDTOToUserLoginRecordDTO(userDTO *dto.UserDTO, loginDTO *dto.LoginDTO) *dto.UserLoginRecordDTO {
	userLoginRecordDTO := &dto.UserLoginRecordDTO{}
	converter.Copy(userLoginRecordDTO, loginDTO)
	userLoginRecordDTO.UserID = userDTO.ID
	userLoginRecordDTO.LoginTime = base.Now()
	userLoginRecordDTO.LoginIP = loginDTO.LoginIP
	userLoginRecordDTO.LoginDeviceID = loginDTO.LoginDeviceID
	userLoginRecordDTO.CreatedBy = userDTO.ID
	userLoginRecordDTO.UpdatedBy = userDTO.ID
	return userLoginRecordDTO
}

func RegisterDTOToUserAddDTO(registerDTO *dto.RegisterDTO) *dto.UserAddDTO {
	userAddDTO := &dto.UserAddDTO{}
	converter.Copy(userAddDTO, registerDTO)
	return userAddDTO
}

func CaptchaResultToCaptchaDTO(captchaResult *captcha.Captcha) *dto.CaptchaDTO {
	captchaDTO := &dto.CaptchaDTO{}
	converter.Copy(captchaDTO, captchaResult)
	return captchaDTO
}

func AuthUserUpdateDTOToUserUpdateDTO(authUserUpdateDTO *dto.AuthUserUpdateDTO, userDTO *dto.UserDTO) *dto.UserDTO {
	converter.Copy(userDTO, authUserUpdateDTO)
	userDTO.UpdatedBy = common.GetLoginUserID()
	return userDTO
}
