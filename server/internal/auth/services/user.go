package services

import (
	"server/common/middleware/database"
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

// GetUserByMobile 根据手机号获取用户
func GetUserByMobile(mobile string) (*dto.UserDTO, error) {
	var err error
	userRepository := repositories.UserRepository

	var user *models.User
	user, err = userRepository.GetOne("select * from auth_user where mobile = ?", mobile)
	if err != nil {
		return nil, err
	}

	userDTO := database.ToDTO[dto.UserDTO](user)
	return userDTO, nil
}
