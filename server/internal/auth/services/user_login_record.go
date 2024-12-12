package services

// // getLastLoginTime
// // @Description 获取用户最后一次登录时间
// func getLastLoginTime(loginUserID uint64) (base.Time, error) {
// 	var err error

// 	userLoginRecordRepository := repositories.NewUserLoginRecordRepository()
// 	userLoginRecord := &models.UserLoginRecord{}
// 	if err = userLoginRecordRepository.FindLastByUserID(loginUserID, userLoginRecord); err != nil {
// 		return base.Time{}, err
// 	}

// 	return userLoginRecord.LoginTime, nil
// }

// // loginReqSaveLoginLog
// // @Description 登录成功记录登录日志
// func loginReqSaveLoginLog(loginUserID uint64, req *dto.LoginReq) error {
// 	var err error
// 	userLoginRecordRepository := repositories.NewUserLoginRecordRepository()

// 	userLoginRecord := &models.UserLoginRecord{}
// 	req.ToUserLoginRecord(loginUserID, userLoginRecord)
// 	if err = userLoginRecordRepository.Create(userLoginRecord); err != nil {
// 		return err
// 	}

// 	return nil
// }
