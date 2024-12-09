package services

import (
	"server/internal/auth/models"
	"server/internal/auth/repositories"
	"server/internal/auth/services/dto"
)

// loginReqSaveLoginLog
// @Description 登录成功记录登录日志
func loginReqSaveLoginLog(loginUserID uint64, req *dto.LoginReq) error {
	var err error
	userLoginRecordRepository := repositories.NewUserLoginRecordRepository()

	userLoginRecord := &models.UserLoginRecord{}
	req.ToUserLoginRecord(loginUserID, userLoginRecord)
	if err = userLoginRecordRepository.Create(userLoginRecord); err != nil {
		return err
	}

	return nil
}
