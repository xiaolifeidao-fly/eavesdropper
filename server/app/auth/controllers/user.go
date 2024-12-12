package controllers

// const (
// 	UserDeleteSuccess = "删除用户成功"
// 	UserUpdateSuccess = "更新用户成功"
// )

// type User struct {
// 	controller.Controller
// }

// func NewUserController(ctx *gin.Context) *User {
// 	return &User{Controller: *controller.NewController(ctx)}
// }

// // Add
// // @Description 添加用户
// // @Router /users [post]
// func Add(ctx *gin.Context) {
// 	userController := NewUserController(ctx)
// 	var req dto.UserAddReq

// 	err := userController.Bind(&req, binding.JSON).Errors
// 	if err != nil {
// 		userController.Logger.Errorf("Add failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	id := uint64(0)
// 	if err = services.AddUser(&req, &id); err != nil {
// 		userController.Logger.Errorf("Add failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}
// 	userController.OK(id)
// }

// // Delete
// // @Description 删除用户
// // @Router /users/:id [delete]
// func Delete(ctx *gin.Context) {
// 	userController := NewUserController(ctx)
// 	var req dto.UserDeleteReq

// 	err := userController.Bind(&req, nil).Errors
// 	if err != nil {
// 		userController.Logger.Errorf("Delete failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	if err = services.DeleteUser(&req); err != nil {
// 		userController.Logger.Errorf("Delete failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}
// 	userController.OK(UserDeleteSuccess)
// }

// // Update
// // @Description 更新用户
// // @Router /users/:id [put]
// func Update(ctx *gin.Context) {
// 	userController := NewUserController(ctx)
// 	var req dto.UserUpdateReq

// 	err := userController.Bind(&req, nil, binding.JSON).Errors
// 	if err != nil {
// 		userController.Logger.Errorf("Update failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	if err = services.UpdateUser(&req); err != nil {
// 		userController.Logger.Errorf("Update failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	userController.OK(UserUpdateSuccess)
// }

// // Get
// // @Description 获取用户
// // @Router /users/:id [get]
// func Get(ctx *gin.Context) {
// 	userController := NewUserController(ctx)
// 	var req dto.UserGetReq

// 	err := userController.Bind(&req, nil).Errors
// 	if err != nil {
// 		userController.Logger.Errorf("Get failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	resp := dto.UserGetResp{}
// 	if err = services.GetUser(&req, &resp); err != nil {
// 		userController.Logger.Errorf("Get failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}
// 	userController.OK(resp)
// }

// // // Page
// // // @Description 分页获取用户
// // // @Router /users/page [get]
// // func Page(ctx *gin.Context) {
// // 	userController := NewUserController(ctx)
// // 	var req dto.UserPageReq

// // 	err := userController.Bind(&req, binding.Form).Errors
// // 	if err != nil {
// // 		userController.Logger.Errorf("Page failed, with error is %v", err)
// // 		userController.Error(err)
// // 		return
// // 	}

// // 	list := make([]*dto.UserPageResp, 0)
// // 	var count int64

// // 	if err = services.PageUser(&req, &list, &count); err != nil {
// // 		userController.Logger.Errorf("Page failed, with error is %v", err)
// // 		userController.Error(err)
// // 		return
// // 	}
// // 	userController.OK(base.BuildPageResp(list, req.GetPageInfo(count)))
// // }

// // GetList
// // @Description 获取用户列表
// // @Router /users/list [get]
// func GetList(ctx *gin.Context) {
// 	userController := NewUserController(ctx)
// 	var req dto.UserGetListReq

// 	err := userController.Bind(&req, binding.Form).Errors
// 	if err != nil {
// 		userController.Logger.Errorf("GetList failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}

// 	list := make([]dto.UserGetListResp, 0)
// 	if err = services.GetUserList(&req, &list); err != nil {
// 		userController.Logger.Errorf("GetList failed, with error is %v", err)
// 		userController.Error(err)
// 		return
// 	}
// 	userController.OK(list)
// }
